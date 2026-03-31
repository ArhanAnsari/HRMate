// Security Service - Input Sanitization and Validation
// Protect against XSS, injection attacks, and malicious input\n\n/**\n * Security-focused sanitization rules\n */\nconst SANITIZATION_RULES = {\n  ALLOWED_TAGS: [] as string[], // Strip all HTML tags\n  SCRIPT_PATTERN: /<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi,\n  HTML_ENTITY_PATTERN: /[&<>\"']/g,\n  SUSPICIOUS_PATTERNS: [\n    /javascript:/gi,\n    /on\\w+\\s*=/gi, // Event handlers like onclick=\n    /data:text\\/html/gi,\n  ],\n};\n\n/**\n * HTML Entity Map for escaping\n */\nconst HTML_ENTITY_MAP: Record<string, string> = {\n  '&': '&amp;',\n  '<': '&lt;',\n  '>': '&gt;',\n  '\"': '&quot;',\n  \"'\": '&#39;',\n};\n\n/**\n * Security Service - Input Sanitization\n */\nexport class SecurityService {\n  /**\n   * Escape HTML special characters\n   */\n  static escapeHtml(text: string): string {\n    if (!text) return \"\";\n    return String(text).replace(\n      SANITIZATION_RULES.HTML_ENTITY_PATTERN,\n      (s) => HTML_ENTITY_MAP[s] || s,\n    );\n  }\n\n  /**\n   * Remove script tags and suspicious patterns\n   */\n  static sanitizeHtml(html: string): string {\n    if (!html) return \"\";\n    \n    let sanitized = String(html);\n    \n    // Remove script tags\n    sanitized = sanitized.replace(SANITIZATION_RULES.SCRIPT_PATTERN, \"\");\n    \n    // Remove suspicious patterns\n    for (const pattern of SANITIZATION_RULES.SUSPICIOUS_PATTERNS) {\n      sanitized = sanitized.replace(pattern, \"\");\n    }\n    \n    // Escape remaining HTML\n    sanitized = this.escapeHtml(sanitized);\n    \n    return sanitized;\n  }\n\n  /**\n   * Sanitize user input for sensitive fields\n   */\n  static sanitizeInput(\n    input: string,\n    options: {\n      maxLength?: number;\n      allowNumbers?: boolean;\n      allowSpecial?: boolean;\n      lowercase?: boolean;\n    } = {},\n  ): string {\n    if (!input) return \"\";\n    \n    let sanitized = String(input).trim();\n    \n    // Remove HTML tags and scripts\n    sanitized = this.sanitizeHtml(sanitized);\n    \n    // Remove extra spaces\n    sanitized = sanitized.replace(/\\s+/g, \" \");\n    \n    // Enforce max length\n    if (options.maxLength) {\n      sanitized = sanitized.substring(0, options.maxLength);\n    }\n    \n    // Remove numbers if not allowed\n    if (!options.allowNumbers) {\n      sanitized = sanitized.replace(/\\d/g, \"\");\n    }\n    \n    // Remove special characters if not allowed\n    if (!options.allowSpecial) {\n      sanitized = sanitized.replace(/[^a-zA-Z0-9\\s]/g, \"\");\n    }\n    \n    // Convert to lowercase if needed\n    if (options.lowercase) {\n      sanitized = sanitized.toLowerCase();\n    }\n    \n    return sanitized;\n  }\n\n  /**\n   * Validate email format\n   */\n  static validateEmail(email: string): boolean {\n    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n    return emailRegex.test(String(email).toLowerCase());\n  }\n\n  /**\n   * Validate password strength\n   */\n  static validatePasswordStrength(\n    password: string,\n  ): {\n    valid: boolean;\n    score: number; // 0-100\n    feedback: string[];\n  } {\n    const feedback: string[] = [];\n    let score = 0;\n\n    if (password.length >= 8) {\n      score += 20;\n    } else {\n      feedback.push(\"Password must be at least 8 characters\");\n    }\n\n    if (password.length >= 12) {\n      score += 10;\n    }\n\n    if (/[a-z]/.test(password)) {\n      score += 15;\n    } else {\n      feedback.push(\"Add lowercase letters\");\n    }\n\n    if (/[A-Z]/.test(password)) {\n      score += 15;\n    } else {\n      feedback.push(\"Add uppercase letters\");\n    }\n\n    if (/\\d/.test(password)) {\n      score += 15;\n    } else {\n      feedback.push(\"Add numbers\");\n    }\n\n    if (/[^a-zA-Z\\d]/.test(password)) {\n      score += 25;\n    } else {\n      feedback.push(\"Add special characters\");\n    }\n\n    return {\n      valid: score >= 60,\n      score: Math.min(score, 100),\n      feedback,\n    };\n  }\n\n  /**\n   * Validate phone number\n   */\n  static validatePhone(phone: string): boolean {\n    const phoneRegex = /^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$/;\n    return phoneRegex.test(phone.replace(/\\s/g, \"\"));\n  }\n\n  /**\n   * Sanitize file name\n   */\n  static sanitizeFileName(fileName: string): string {\n    if (!fileName) return \"file\";\n    \n    let sanitized = String(fileName);\n    \n    // Remove path separators\n    sanitized = sanitized.replace(/[\\/\\\\]/g, \"\");\n    \n    // Remove special characters except dots and dashes\n    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, \"\");\n    \n    // Remove consecutive dots (prevent ../ traversal)\n    sanitized = sanitized.replace(/\\.{2,}/g, \".\");\n    \n    // Limit length\n    sanitized = sanitized.substring(0, 255);\n    \n    return sanitized || \"file\";\n  }\n\n  /**\n   * Validate URL format\n   */\n  static validateUrl(urlString: string): boolean {\n    try {\n      const url = new URL(urlString);\n      return url.protocol === \"http:\" || url.protocol === \"https:\";\n    } catch {\n      return false;\n    }\n  }\n\n  /**\n   * Create Content Security Policy header\n   */\n  static generateCSPHeader(): string {\n    return (\n      \"default-src 'self'; \" +\n      \"script-src 'self'; \" +\n      \"style-src 'self' 'unsafe-inline'; \" +\n      \"img-src 'self' data: https:; \" +\n      \"font-src 'self'; \" +\n      \"connect-src 'self' https:; \" +\n      \"frame-ancestors 'none'; \" +\n      \"base-uri 'self'; \" +\n      \"form-action 'self'\"\n    );\n  }\n\n  /**\n   * Generate security headers\n   */\n  static getSecurityHeaders(): Record<string, string> {\n    return {\n      \"X-Content-Type-Options\": \"nosniff\",\n      \"X-Frame-Options\": \"DENY\",\n      \"X-XSS-Protection\": \"1; mode=block\",\n      \"Strict-Transport-Security\": \"max-age=31536000; includeSubDomains\",\n      \"Content-Security-Policy\": this.generateCSPHeader(),\n      \"Referrer-Policy\": \"strict-origin-when-cross-origin\",\n      \"Permissions-Policy\": \"geolocation=(), microphone=(), camera=()\",\n    };\n  }\n}\n\nexport default SecurityService;\n
export class SecurityService {
  static sanitizeInput(input: string): string {
    // Basic sanitization to remove script tags and escape HTML
    if (!input) return "";
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password: string): boolean {
        // Password must be at least 8 characters, contain uppercase, lowercase, number, and special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    static validatePhone(phone: string): boolean {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
        return phoneRegex.test(phone);
    }

    static sanitizeFileName(fileName: string): string {
        if (!fileName) return "file";
        return fileName
            .replace(/[\/\\?%*:|"<>]/g, "")
            .replace(/\s+/g, "_")
            .substring(0, 255) || "file";
    }

    static validateUrl(urlString: string): boolean {
        try {
            const url = new URL(urlString);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        } 
    }

    static generateCSPHeader(): string {
        return (
            "default-src 'self'; " +
            "script-src 'self'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https:; " +
            "font-src 'self'; " +
            "connect-src 'self' https:; " +
            "frame-ancestors 'none'; " +
            "base-uri 'self'; " +
            "form-action 'self'"
        );
    }

    static getSecurityHeaders(): Record<string, string> {
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": this.generateCSPHeader(),
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
        };
    }
}

export default SecurityService;