
// Interfaces aligning with backend Pydantic models
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
    response_schema?: any;
}

interface ApiSchema {
    title: string;
    description?: string;
    base_url?: string;
    endpoints: Endpoint[];
}

interface ApiViewerProps {
    schema: ApiSchema | null;
}

import { EndpointTester } from './EndpointTester';
import { CodeModal } from './CodeModal';
import { useState } from 'react';

export function ApiViewer({ schema }: ApiViewerProps) {
    const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);

    if (!schema) return null;

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            border: '1px solid var(--border-color)'
        }}>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem', fontWeight: 800 }}>{schema.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', marginTop: '1rem' }}>
                <span style={{
                    background: '#f3f4f6',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    border: '1px solid #e5e7eb'
                }}>
                    Doc Quality ⚡ 10/10
                </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>{schema.description}</p>


            {schema.base_url && (
                <div style={{
                    background: '#f8f9fa',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '2.5rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem',
                    color: '#4b5563',
                    border: '1px solid #e5e7eb',
                    display: 'inline-block'
                }}>
                    <span style={{ fontWeight: 600, color: '#9ca3af', marginRight: '0.5rem' }}>Base URL:</span>
                    {schema.base_url}
                </div>
            )}

            <div style={{ marginBottom: '1rem' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {schema.endpoints.map((endpoint, index) => (
                    <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
                        <div style={{
                            background: '#fff',
                            padding: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            borderBottom: '1px solid #e5e7eb',
                            flexWrap: 'wrap'
                        }}>
                            <span style={{
                                background: `${getMethodColor(endpoint.method)}15`,
                                color: getMethodColor(endpoint.method),
                                padding: '0.25rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                minWidth: '60px',
                                textAlign: 'center',
                                border: `1px solid ${getMethodColor(endpoint.method)}30`
                            }}>
                                {endpoint.method}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '1.1rem', color: '#1f2937' }}>{endpoint.path}</span>
                            <span style={{ fontSize: '0.95rem', color: '#9ca3af', marginLeft: 'auto', marginRight: '1rem' }}>
                                {endpoint.description?.slice(0, 60)}{endpoint.description && endpoint.description.length > 60 ? '...' : ''}
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setSelectedEndpoint(endpoint)}
                                    style={{ background: 'white', border: '1px solid #e5e7eb', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', color: '#4b5563', fontWeight: 500 }}
                                >
                                    Code
                                </button>
                                <button style={{ background: 'white', border: '1px solid #e5e7eb', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', color: '#4b5563', fontWeight: 500 }}>Try it out</button>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <p style={{ fontSize: '0.95rem', color: '#4b5563', marginTop: 0, lineHeight: '1.6', marginBottom: '1.5rem' }}>{endpoint.description}</p>

                            {endpoint.parameters.length > 0 && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Parameters</h4>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                            <tbody>
                                                {endpoint.parameters.map((param, idx) => (
                                                    <tr key={idx} style={{ borderBottom: idx !== endpoint.parameters.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                                        <td style={{ padding: '1rem 0', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#1f2937', width: '20%' }}>{param.name}</td>
                                                        <td style={{ padding: '1rem 0', color: '#ec4899', fontWeight: 500, width: '15%' }}>{param.type}</td>
                                                        <td style={{ padding: '1rem 0', color: '#6b7280', lineHeight: 1.6 }}>
                                                            {param.description}
                                                            {param.required && <span style={{ color: '#ef4444', marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 500 }}>(required)</span>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '2rem' }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Example Usage</h4>
                                <div style={{
                                    background: '#111827',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.85rem',
                                    color: '#e5e7eb',
                                    overflowX: 'auto',
                                    border: '1px solid #374151'
                                }}>
                                    {schema.base_url}{endpoint.path}
                                </div>
                            </div>
                            <div style={{ marginTop: '2rem' }}>
                                <EndpointTester endpoint={endpoint} baseUrl={schema.base_url} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedEndpoint && schema.base_url && (
                <CodeModal
                    endpoint={selectedEndpoint}
                    baseUrl={schema.base_url}
                    onClose={() => setSelectedEndpoint(null)}
                />
            )}
        </div>
    );
}

function getMethodColor(method: string) {
    switch (method.toUpperCase()) {
        case 'GET': return '#3b82f6';
        case 'POST': return '#10b981';
        case 'PUT': return '#f59e0b';
        case 'DELETE': return '#ef4444';
        default: return '#6b7280';
    }
}
