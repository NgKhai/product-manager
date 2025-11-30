# Security Documentation

This document provides a detailed explanation of all security measures implemented in this REST API.

## Table of Contents
1. [Password Security](#password-security)
2. [JWT Authentication](#jwt-authentication)
3. [HTTP-Only Cookies](#http-only-cookies)
4. [Rate Limiting](#rate-limiting)
5. [CORS Protection](#cors-protection)
6. [Security Headers](#security-headers)
7. [Input Validation](#input-validation)
8. [Database Security](#database-security)
9. [Best Practices](#best-practices)

---

## Password Security

### Bcrypt Hashing

We use **bcrypt** for password hashing, which is considered the industry standard for password storage.

**How it works:**
```javascript
// When user registers or changes password
const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
const hashedPassword = await bcrypt.hash(password, salt);
```

**Why bcrypt?**
- **Slow by design**: Makes brute force attacks impractical
- **Salt included**: Each password has a unique salt, preventing rainbow table attacks
- **Adaptive**: Cost factor can be increased as hardware improves
- **Battle-tested**: Used by major companies worldwide

**Security level:**
- 10 rounds = ~100ms to hash (good balance between security and performance)
- Each additional round doubles the time required to crack

### Password Requirements

Enforced through validation middleware:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number

**Why these requirements?**
- Increases password entropy
- Makes dictionary attacks harder
- Forces users to create stronger passwords

---

## JWT Authentication

### Two-Token System

We implement a **dual-token authentication** system:

1. **Access Token** (short-lived: 15 minutes)
   - Used for API requests
   - Contains user ID and role
   - Short expiration reduces risk if compromised

2. **Refresh Token** (long-lived: 7 days)
   - Used to obtain new access tokens
   - Stored in HTTP-only cookie
   - Can be revoked (stored in database)

### Token Structure

```javascript
// Access Token Payload
{
  userId: "user_id_here",
  role: "user" or "admin",
  type: "access",
  iat: issued_at_timestamp,
  exp: expiration_timestamp,
  iss: "secure-rest-api",
  aud: "api-users"
}

// Refresh Token Payload
{
  userId: "user_id_here",
  type: "refresh",
  iat: issued_at_timestamp,
  exp: expiration_timestamp,
  iss: "secure-rest-api",
  aud: "api-users"
}
```

### Token Flow

1. **Login:**
   - User provides credentials
   - Server validates and generates both tokens
   - Access token sent in response body
   - Refresh token sent as HTTP-only cookie

2. **API Request:**
   - Client sends access token in `Authorization: Bearer <token>` header
   - Server validates token
   - If valid, processes request
   - If expired, client must use refresh token

3. **Token Refresh:**
   - Client sends refresh token
   - Server validates and checks if it exists in database
   - If valid, generates new token pair
   - Old refresh token is revoked

4. **Logout:**
   - Refresh token removed from database
   - HTTP-only cookie cleared
   - Client discards access token

### Why This Approach?

- **Security**: Short-lived access tokens minimize damage if compromised
- **User Experience**: Users don't need to log in frequently
- **Revocable**: Refresh tokens can be invalidated server-side
- **Multiple Devices**: Each device gets its own refresh token

---

## HTTP-Only Cookies

### What are HTTP-Only Cookies?

Cookies with the `httpOnly` flag **cannot be accessed by JavaScript**.

```javascript
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,           // JavaScript can't access
  secure: true,             // HTTPS only (production)
  sameSite: 'strict',       // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

### Security Benefits

| Storage Method | XSS Vulnerable? | CSRF Vulnerable? | Best For |
|---------------|-----------------|------------------|----------|
| localStorage | ✗ Yes | ✓ No | Not recommended for tokens |
| Regular Cookie | ✗ Yes | ✗ Yes | Not recommended |
| HTTP-Only Cookie | ✓ No | ⚠️ Mitigated | **Refresh tokens** |
| Authorization Header | ⚠️ If stored in localStorage | ✓ No | **Access tokens** |

**Our Implementation:**
- Access tokens: Sent via Authorization header (client stores in memory)
- Refresh tokens: HTTP-only cookies (protected from XSS)

### SameSite Attribute

```javascript
sameSite: 'strict'
```

**Options:**
- `strict`: Cookie only sent to same-site requests (maximum protection)
- `lax`: Cookie sent on top-level navigation (moderate protection)
- `none`: Cookie sent to all requests (requires `secure: true`)

**We use `strict`** to prevent CSRF attacks.

---

## Rate Limiting

### Protection Levels

We implement **tiered rate limiting**:

#### 1. General API Limiter
```javascript
windowMs: 15 minutes
max: 100 requests per IP
```
- Applied to all `/api/*` routes
- Prevents API abuse and DDoS

#### 2. Authentication Limiter  
```javascript
windowMs: 15 minutes
max: 5 requests per IP
```
- Applied to login/register routes
- Prevents brute force password attacks

#### 3. Account Creation Limiter
```javascript
windowMs: 1 hour
max: 3 accounts per IP
```
- Applied to registration route
- Prevents spam account creation

### How It Works

```
Request → Check IP in memory store → 
  ├─ Under limit? → Allow + Increment counter
  └─ Over limit? → Return 429 (Too Many Requests)
```

### Bypass Prevention

- Uses `X-Forwarded-For` header (for proxies/Vercel)
- `app.set('trust proxy', 1)` configured
- Counts per IP address, not per user

---

## CORS Protection

### Configuration

```javascript
const allowedOrigins = [
  'https://yourfrontend.com',
  'https://app.yourfrontend.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true  // Allow cookies
}));
```

### What CORS Prevents

- Unauthorized websites from accessing your API
- Data theft from malicious sites
- Unwanted cross-origin requests

### Configuration for Production

Set `ALLOWED_ORIGINS` environment variable:
```
ALLOWED_ORIGINS=https://myapp.com,https://admin.myapp.com
```

---

## Security Headers

### Helmet.js

We use **Helmet.js** to set various HTTP security headers:

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  }
}));
```

### Headers Set by Helmet

| Header | Purpose |
|--------|---------|
| `Content-Security-Policy` | Prevents XSS by controlling resource loading |
| `X-DNS-Prefetch-Control` | Controls browser DNS prefetching |
| `X-Frame-Options` | Prevents clickjacking |
| `X-Content-Type-Options` | Prevents MIME type sniffing |
| `Strict-Transport-Security` | Forces HTTPS usage |
| `X-Download-Options` | Prevents file download injection |
| `X-Permitted-Cross-Domain-Policies` | Controls Adobe Flash/PDF cross-domain requests |

---

## Input Validation

### Express Validator

We use **express-validator** for comprehensive input validation:

```javascript
// Example: Registration validation
validateRegistration = [
  body('email')
    .trim()              // Remove whitespace
    .isEmail()           // Valid email format
    .normalizeEmail(),   // Normalize format
    
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    
  validate  // Check results middleware
];
```

### Sanitization

**Prevents NoSQL Injection:**

```javascript
const sanitizeInput = (req, res, next) => {
  // Remove MongoDB operators like $where, $ne, etc.
  // Remove special characters: $, {, }
  // Sanitize body, query, and params
};
```

**Example Attack Prevented:**
```javascript
// Malicious input
{ "email": { "$ne": null }, "password": { "$ne": null } }

// After sanitization
{ "email": "ne: null", "password": "ne: null" }
```

---

## Database Security

### MongoDB Protection

1. **No Direct Data Exposure**
   ```javascript
   userSchema.methods.toJSON = function() {
     const user = this.toObject();
     delete user.password;
     delete user.refreshTokens;
     return user;
   };
   ```

2. **Password Field Hidden by Default**
   ```javascript
   password: {
     type: String,
     select: false  // Never returned in queries
   }
   ```

3. **Connection Security**
   - Use SSL/TLS for MongoDB connections
   - Restrict IP addresses in MongoDB Atlas
   - Use strong database passwords

4. **Indexes for Performance**
   ```javascript
   userSchema.index({ email: 1 });  // Faster lookups
   ```

### Preventing Injection

- Input sanitization middleware
- Mongoose schema validation
- No eval() or Function() usage
- Parameterized queries (Mongoose handles this)

---

## Best Practices

### ✅ Do's

1. **Use HTTPS in Production**
   ```javascript
   secure: process.env.NODE_ENV === 'production'
   ```

2. **Store Secrets in Environment Variables**
   - Never commit `.env` to Git
   - Use strong random secrets (64+ characters)

3. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm update
   ```

4. **Implement Logging**
   - Log all authentication attempts
   - Monitor for suspicious patterns
   - Use services like Sentry for error tracking

5. **Regular Security Audits**
   - Review code for vulnerabilities
   - Use tools like Snyk or npm audit
   - Keep up with security advisories

### ❌ Don'ts

1. **Never Log Sensitive Data**
   - Don't log passwords, tokens, or secrets
   - Sanitize logs before storing

2. **Don't Trust Client Input**
   - Always validate on the server
   - Never assume data is safe

3. **Don't Use Weak Secrets**
   - Minimum 32 characters for JWT secrets
   - Use cryptographically secure random generation

4. **Don't Expose Stack Traces in Production**
   ```javascript
   error: process.env.NODE_ENV === 'development' ? error.stack : undefined
   ```

5. **Don't Store Sensitive Data Unnecessarily**
   - Only store what you need
   - Delete old refresh tokens
   - Implement data retention policies

---

## Security Checklist for Production

- [ ] HTTPS enabled
- [ ] Strong JWT secrets generated
- [ ] Environment variables set
- [ ] CORS origins configured
- [ ] MongoDB IP whitelist updated
- [ ] Rate limiting tested
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies updated
- [ ] Security headers verified
- [ ] Logs configured properly

---

## Reporting Security Issues

If you discover a security vulnerability, please email [security@yourcompany.com](mailto:security@yourcompany.com).

**Do not** create public GitHub issues for security vulnerabilities.

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT.io](https://jwt.io/)
- [bcrypt documentation](https://www.npmjs.com/package/bcryptjs)

---

**Last Updated:** November 2024
