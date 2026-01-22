import { useState } from 'react'
import { ApiViewer } from './components/ApiViewer'
import { SdkViewer } from './components/SdkViewer'

function App() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [schema, setSchema] = useState(null)
    const [generatedCode, setGeneratedCode] = useState<{ language: string, code: string } | null>(null)
    const [error, setError] = useState('')

    const handleParse = async () => {
        if (!url) return;
        setLoading(true);
        setError('');
        setSchema(null);
        setGeneratedCode(null);

        try {
            // 1. Parse Documentation
            const response = await fetch('/api/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (!response.ok) {
                let errorMessage = 'Failed to parse documentation';
                if (data.detail) {
                    errorMessage = data.detail;
                    if (data.errors) {
                        errorMessage += ': ' + JSON.stringify(data.errors);
                    }
                } else if (data.message) {
                    errorMessage = data.message;
                } else {
                    errorMessage += ' (Status: ' + response.status + ')';
                }
                throw new Error(errorMessage);
            }

            setSchema(data);

            // 2. Generate SDK automatically
            const sdkResponse = await fetch('/api/generate-sdk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!sdkResponse.ok) {
                const sdkData = await sdkResponse.json();
                throw new Error(sdkData.detail || 'Failed to generate SDK');
            }

            const sdkData = await sdkResponse.json();
            setGeneratedCode(sdkData);

        } catch (err: any) {
            console.error("Process error:", err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = (content: string | Blob, filename: string, contentType: string) => {
        const link = document.createElement('a');
        if (content instanceof Blob) {
            link.href = URL.createObjectURL(content);
        } else {
            const blob = new Blob([content], { type: contentType });
            link.href = URL.createObjectURL(blob);
        }
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportMarkdown = async () => {
        if (!schema) return;
        try {
            const response = await fetch('/api/export-markdown', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(schema)
            });
            if (!response.ok) throw new Error('Failed to export Markdown');
            const data = await response.json();
            downloadFile(data.markdown, 'api-documentation.md', 'text/markdown');
        } catch (err) {
            console.error(err);
            setError('Failed to export Markdown');
        }
    };

    const handleExportPostman = async () => {
        if (!schema) return;
        try {
            const response = await fetch('/api/export-postman', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(schema)
            });
            if (!response.ok) throw new Error('Failed to export Postman collection');
            const data = await response.json();
            downloadFile(JSON.stringify(data, null, 2), 'postman_collection.json', 'application/json');
        } catch (err) {
            console.error(err);
            setError('Failed to export Postman collection');
        }
    };

    const handleExportJson = () => {
        if (!schema) return;
        downloadFile(JSON.stringify(schema, null, 2), 'api-schema.json', 'application/json');
    };

    return (
        <>
            <div className="container">
                <header className="hero-section">
                    <div className="badge">AI-POWERED INTEGRATION</div>
                    <h1 className="hero-title">
                        Smart API <br />
                        <span className="gradient-text">Integration</span>
                    </h1>
                </header>

                <div className="search-container">
                    <div className="input-wrapper">
                        <span className="link-icon">🔗</span>
                        <input
                            type="text"
                            placeholder="Paste API Documentation URL..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={loading}
                            onKeyDown={(e) => e.key === 'Enter' && handleParse()}
                        />
                        <button onClick={handleParse} disabled={loading} className="generate-btn">
                            {loading ? <div className="spinner-sm"></div> : 'Generate SDK'}
                        </button>
                    </div>

                    {schema && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                            <button className="export-btn" style={{ background: '#374151' }} onClick={handleExportMarkdown}>Markdown</button>
                            <button className="export-btn" style={{ background: '#f97316' }} onClick={handleExportPostman}>Postman</button>
                            <button className="export-btn" style={{ background: '#c026d3' }} onClick={handleExportJson}>Export JSON</button>
                        </div>
                    )}
                    {error && <p className="error-message">{error}</p>}
                </div>

                {schema && <div style={{ marginTop: '2rem' }}><ApiViewer schema={schema} /></div>}

                {generatedCode && (
                    <SdkViewer code={generatedCode.code} language={generatedCode.language} />
                )}
            </div>
        </>
    )
}

export default App
