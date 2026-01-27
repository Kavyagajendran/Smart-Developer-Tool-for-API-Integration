
interface SyntaxHighlightProps {
    code: string;
}

// Simple syntax highlighter for Python to match the screenshot without heavy deps
export const SyntaxHighlight = ({ code }: SyntaxHighlightProps) => {
    const tokens = code.split(/(\s+|"[\s\S]*?"|'[\s\S]*?'|[()[\]{},:.]|#.*$)/m);

    return (
        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            {tokens.map((token, i) => {
                let color = '#d4d4d4'; // Default text (white-ish)

                // Keywords (Purple/Pink)
                if (/^(import|from|class|def|return|if|else|elif|try|except|with|as|pass|None|True|False|is|in|not|and|or|const|let|var|function|async|await|console)$/.test(token)) {
                    color = '#c586c0';
                }
                // Self (Blue/Red in some themes, let's stick to screenshot - looks reddish/orange or purple)
                else if (token === 'self' || token === 'this') {
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
                else if (token.startsWith('#') || token.startsWith('//')) {
                    color = '#6a9955';
                }
                // Special function calls (e.g., requests, print) roughly guessed
                else if (['requests', 'print', 'super', 'fetch', 'log', 'error'].includes(token)) {
                    color = '#4ec9b0';
                }
                // Curl specific
                else if (token.startsWith('-') || token === 'curl') {
                    color = '#569cd6';
                }

                return <span key={i} style={{ color }}>{token}</span>;
            })}
        </code>
    );
};
