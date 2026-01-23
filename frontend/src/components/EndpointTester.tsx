import { useState } from 'react';

interface Parameter {
    name: string;
    type: string;
    required: boolean;
    description?: string;
}

interface Endpoint {
    path: string;
    method: string;
    description?: string;
    parameters: Parameter[];
}

interface EndpointTesterProps {
    endpoint: Endpoint;
    baseUrl?: string;
}

export function EndpointTester({ endpoint, baseUrl }: EndpointTesterProps) {
    const [pathParams, setPathParams] = useState<Record<string, string>>({});
    const [queryParams, setQueryParams] = useState<Record<string, string>>({});
    const [headers] = useState<Record<string, string>>({ 'Content-Type': 'application/json' });
    const [body, setBody] = useState<string>('{\n  \n}');
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Identify path parameters from the URL path (e.g., /users/{id})
    const pathParamNames = (endpoint.path.match(/{([^}]+)}/g) || []).map(p => p.slice(1, -1));

    // Remaining parameters are treated as query parameters for GET/DELETE or simple POSTs
    const queryParamDefs = endpoint.parameters.filter(p => !pathParamNames.includes(p.name));

    const handleSendRequest = async () => {
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            // Construct URL
            let url = (baseUrl || '') + endpoint.path;

            // Replace path params
            for (const [key, value] of Object.entries(pathParams)) {
                url = url.replace(`{${key}}`, value);
            }

            // Clean up any remaining braces if user didn't fill them (optional: warn user)

            // Construct payload
            const payload = {
                url,
                method: endpoint.method,
                params: queryParams,
                headers: headers,
                body: ['POST', 'PUT', 'PATCH'].includes(endpoint.method.toUpperCase()) ? JSON.parse(body) : undefined
            };

            const res = await fetch('http://localhost:8000/api/health-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            setResponse(data);
        } catch (err: any) {
            setError(err.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#4b5563' }}>Test Endpoint</h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {/* Path Parameters */}
                {pathParamNames.length > 0 && (
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Path Parameters</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                            {pathParamNames.map(name => (
                                <input
                                    key={name}
                                    type="text"
                                    placeholder={`{${name}}`}
                                    value={pathParams[name] || ''}
                                    onChange={e => setPathParams(prev => ({ ...prev, [name]: e.target.value }))}
                                    style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem' }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Query Parameters */}
                {queryParamDefs.length > 0 && (
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Query Parameters</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                            {queryParamDefs.map(param => (
                                <div key={param.name} style={{ display: 'flex', flexDirection: 'column' }}>
                                    <input
                                        type="text"
                                        placeholder={`${param.name}${param.required ? '*' : ''}`}
                                        value={queryParams[param.name] || ''}
                                        onChange={e => setQueryParams(prev => ({ ...prev, [param.name]: e.target.value }))}
                                        style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem' }}
                                    />
                                    {param.description && <span style={{ fontSize: '0.7rem', color: '#999', marginTop: '2px' }}>{param.description}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Request Body for POST/PUT */}
            {['POST', 'PUT', 'PATCH'].includes(endpoint.method.toUpperCase()) && (
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Request Body (JSON)</label>
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        style={{ width: '100%', height: '100px', padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
            )}

            <button
                onClick={handleSendRequest}
                disabled={loading}
                className="generate-btn"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
                {loading ? <div className="spinner-sm" /> : 'Send Request'}
            </button>

            {/* Response Display */}
            {error && <div className="error-message" style={{ textAlign: 'left', marginTop: '1rem' }}>{error}</div>}

            {response && (
                <div style={{ marginTop: '1rem', background: '#2d2d2d', color: '#fff', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ padding: '0.5rem 1rem', background: '#1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Response</span>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                            <span style={{ color: response.is_healthy ? '#4ade80' : '#ef4444' }}>Status: {response.status_code || 'Error'}</span>
                            <span style={{ color: '#94a3b8' }}>Time: {response.latency_ms}ms</span>
                        </div>
                    </div>
                    <pre style={{ margin: 0, padding: '1rem', overflowX: 'auto', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {response.error ? response.error : JSON.stringify(response.response_data || response, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
