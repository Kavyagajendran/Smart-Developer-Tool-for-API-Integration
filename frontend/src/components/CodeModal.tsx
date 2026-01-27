import { useState, useEffect } from 'react';
import { SyntaxHighlight } from './SyntaxHighlight';

interface Endpoint {
    path: string;
    method: string;
    description?: string;
    parameters: any[];
}

interface CodeModalProps {
    endpoint: Endpoint;
    baseUrl: string;
    onClose: () => void;
}

export function CodeModal({ endpoint, baseUrl, onClose }: CodeModalProps) {
    const [activeTab, setActiveTab] = useState<'Python' | 'NodeJs' | 'CURL'>('Python');
    const [code, setCode] = useState('Loading...');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchSnippet = async () => {
            setCode('Loading...');
            try {
                const langMap: Record<string, string> = {
                    'Python': 'python',
                    'NodeJs': 'javascript',
                    'CURL': 'curl'
                };

                const response = await fetch('http://localhost:8000/api/generate-snippet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        endpoint: endpoint,
                        base_url: baseUrl,
                        language: langMap[activeTab]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setCode(data.snippet);
                } else {
                    setCode('Error loading snippet');
                }
            } catch (err) {
                setCode('Error loading snippet');
                console.error(err);
            }
        };

        fetchSnippet();
    }, [activeTab, endpoint, baseUrl]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(2px)' // Blur effect from screenshot
        }} onClick={onClose}>
            <div style={{
                background: '#0d1117', // Dark modal background
                width: '600px',
                maxWidth: '90%',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid #30363d',
                display: 'flex',
                flexDirection: 'column'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #30363d'
                }}>
                    <h3 style={{ margin: 0, color: '#e6edf3', fontSize: '1rem', fontWeight: 600 }}>Code Snippet</h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem' }}
                    >✕</button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #30363d',
                    padding: '0 1rem'
                }}>
                    {['Python', 'NodeJs', 'CURL'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                padding: '1rem 1rem',
                                color: activeTab === tab ? '#58a6ff' : '#8b949e',
                                borderBottom: activeTab === tab ? '2px solid #58a6ff' : '2px solid transparent',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Code Area */}
                <div style={{ padding: '1.5rem', position: 'relative', minHeight: '200px', background: '#0d1117' }}>
                    <div style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        zIndex: 10
                    }}>
                        <button
                            onClick={handleCopy}
                            style={{
                                background: '#21262d',
                                border: '1px solid #30363d',
                                color: '#c9d1d9',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#30363d'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#21262d'}
                        >
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>

                    <pre style={{ margin: 0, paddingRight: '4rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                        <SyntaxHighlight code={code} />
                    </pre>
                </div>
            </div>
        </div>
    );
}
