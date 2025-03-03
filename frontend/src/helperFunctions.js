export const detectLanguage = (text) => {
    if (!text || typeof text !== "string") return "plaintext"; // Handle empty input

    switch (true) {
        // JSON: Must start with `{}` or `[]` and follow JSON-like structure
        case /^\s*\{[\s\n]*("|')?\w+\1?:/.test(text) || /^\s*\[.*\]\s*$/.test(text):
            return "json";

        // Python: Functions, imports, class definitions, or Pythonic syntax
        case /^\s*def\s+\w+\(/.test(text): // Function definition
        case /^\s*import\s+\w+/.test(text): // Import statement
        case /^\s*class\s+\w+\s*\(/.test(text): // Class definition
        case /^\s*print\(["']/.test(text): // print() function
        case /\bself\b/.test(text): // `self` keyword (OOP)
        case /\b(lambda|yield|async|await|try|except)\b/.test(text): // Python keywords
            return "python";

        // JavaScript: ES6 imports, variable declarations, function definitions
        case /^\s*import .* from ['"].*['"];?/.test(text): // ES6 import
        case /^\s*(const|let|var) .*=\s*.*=>/m.test(text): // Arrow function
        case /\bfunction\s+\w+\(/.test(text): // Function declaration
        case /\b(console\.log|document\.querySelector)\b/.test(text): // Common JS functions
        case /\bclass\s+\w+\s*\{/.test(text): // Class definition
            return "javascript";

        // HTML: Detects <html>, <head>, <body>, and common HTML tags
        case /<\/?(html|head|body|div|span|p|a|img|h[1-6]|script|style|meta|title)\b[^>]*>/i.test(text):
            return "html";

        // CSS: Looks for CSS rules with selectors and properties
        case /\b[a-zA-Z0-9\-_]+\s*\{\s*[^{}]+\s*\}/.test(text):
        case /\b(color|background|font|border|padding|margin):\s*[^;]+;/.test(text):
            return "css";

        // SQL: Detects common SQL keywords and syntax
        case /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|ORDER BY|GROUP BY|HAVING|LIMIT)\b/i.test(text.toUpperCase()):
            return "sql";

        // Shell Script (Bash): Detects `#!/bin/bash` or common shell commands
        case /^#!\s*\/bin\/bash/.test(text):
        case /\b(echo|cd|ls|pwd|grep|awk|sed|chmod|sudo)\b/.test(text):
            return "shell";

        // Default: Plain Text (fallback)
        default:
            return "plaintext";
    }
};

