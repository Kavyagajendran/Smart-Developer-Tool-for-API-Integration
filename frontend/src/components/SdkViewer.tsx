import { useState } from 'react';

interface SdkViewerProps {
    code: string;
    language: string;
}

// Simple syntax highlighter for Python to match the screenshot without heavy deps
const SyntaxHighlight = ({ code }: { code: string }) => {
    const tokens = code.split(/(\s+|"[\s\S]*?"|'[\s\S]*?'|[()[\]{},:.]|#.*$)/m);

    return (
        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            {tokens.map((token, i) => {
                let color = '#d4d4d4'; // Default text (white-ish)

                // Keywords (Purple/Pink)
                if (/^(import|from|class|def|return|if|else|elif|try|except|with|as|pass|None|True|False|is|in|not|and|or)$/.test(token)) {
                    color = '#c586c0';
                }
                // Self (Blue/Red in some themes, let's stick to screenshot - looks reddish/orange or purple)
                else if (token === 'self') {
                    color = '#569cd6'; // VS Code Blue for self/variables usually, but screenshot looks distinct.
                }
                // Functions/Classes (Yellow)
                else if (/^[A-Z][a-zA-Z0-9_]*$/.test(token)) { // Simple TitleCase check for classes
                    color = '#dcdcaa'; // VS Code Yellow
                }
                // Strings (Green)
                else if (/^["']/.test(token)) {
                    color = '#ce9178'; // VS Code String Orange
                }
                // Numbers (Light Green)
                else if (/^\d+$/.test(token)) {
                    color = '#b5cea8';
                }
                // Comments (Green)
                else if (token.startsWith('#')) {
                    color = '#6a9955';
                }
                // Special function calls (e.g., requests, print) roughly guessed
                else if (['requests', 'print', 'super'].includes(token)) {
                    color = '#4ec9b0';
                }

                return <span key={i} style={{ color }}>{token}</span>;
            })}
        </code>
    );
};

export function SdkViewer({ code, language }: SdkViewerProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `client.${language === 'python' ? 'py' : 'txt'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{
            marginTop: '3rem',
            background: '#1e1e1e', // VS Code dark bg
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid #333'
        }}>
            {/* Header / Window Controls */}
            <div style={{
                background: '#333333', // Slightly lighter gray header
                padding: '0.8rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #252526'
            }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56', border: '1px solid #e0443e' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e', border: '1px solid #dea123' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f', border: '1px solid #1aab29' }}></div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={handleDownload}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 500,
                            padding: '0.25rem 0.5rem',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                    >
                        <span style={{ fontSize: '0.9rem' }}>⬇</span> Download SDK
                    </button>
                    <button
                        onClick={handleCopy}
                        style={{
                            background: '#d946ef', // Pink copy button
                            border: 'none',
                            color: 'white',
                            padding: '0.4rem 1.25rem',
                            borderRadius: '20px', // Pill shape in screenshot
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(217, 70, 239, 0.3)'
                        }}
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            {/* Code Content */}
            <div style={{
                padding: '1.5rem',
                overflowX: 'auto',
                fontSize: '13px',
                lineHeight: '1.6',
                background: '#1e1e1e',
                color: '#d4d4d4'
            }}>
                <pre style={{ margin: 0, fontFamily: 'var(--font-mono)' }}>
                    <SyntaxHighlight code={code} />
                </pre>
            </div>
        </div>
    );
}
