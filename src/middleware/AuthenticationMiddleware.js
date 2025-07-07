import jwt from 'jsonwebtoken';

export default async function AuthenticatedMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: 'Authorization header missing',
                message: 'Access token required'
            });
        }

        const tokenParts = authHeader.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return res.status(401).json({
                error: 'Invalid authorization format',
                message: 'Format should be: Bearer <token>'
            });
        }

        const token = tokenParts[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
            
            // Validasi format token - pastikan semua field required ada
            if (!decoded.id || !decoded.iat || !decoded.jti || !decoded.type || !decoded.iss || !decoded.aud || !decoded.exp) {
                return res.status(403).json({
                    error: 'Invalid token format',
                    message: 'Token is missing required fields'
                });
            }

            // Validasi issuer (iss)
            const expectedIssuer = process.env.JWT_ISSUER;
            if (decoded.iss !== expectedIssuer) {
                return res.status(403).json({
                    error: 'Invalid token issuer',
                    message: `Token issuer mismatch. Expected: ${expectedIssuer}, Got: ${decoded.iss}`
                });
            }

            // Validasi audience (aud)
            const expectedAudience = process.env.JWT_AUDIENCE;
            if (decoded.aud !== expectedAudience) {
                return res.status(403).json({
                    error: 'Invalid token audience',
                    message: `Token audience mismatch. Expected: ${expectedAudience}, Got: ${decoded.aud}`
                });
            }

            // Validasi token type
            if (decoded.type !== 'access') {
                return res.status(403).json({
                    error: 'Invalid token type',
                    message: `Expected access token, got: ${decoded.type}`
                });
            }

            // Validasi expiration (exp) - pastikan token belum expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp <= currentTime) {
                return res.status(401).json({
                    error: 'Token expired',
                    message: `Access token has expired at ${new Date(decoded.exp * 1000).toISOString()}`
                });
            }

            // Validasi issued at (iat) - pastikan token tidak dari masa depan
            if (decoded.iat > currentTime) {
                return res.status(403).json({
                    error: 'Invalid token time',
                    message: 'Token issued in the future'
                });
            }

            // Validasi JWT ID (jti) - pastikan format valid
            if (typeof decoded.jti !== 'string' || decoded.jti.length === 0) {
                return res.status(403).json({
                    error: 'Invalid token ID',
                    message: 'Token ID is missing or invalid'
                });
            }

            const userIdentifier = decoded.id;
            console.log(`Access granted for user: ${userIdentifier}`);
            
            // Attach decoded token to request for use in subsequent middleware/routes
            req.token = {
                id: decoded.id,
                role: decoded.role,
                jti: decoded.jti,
                iat: decoded.iat,
                exp: decoded.exp
            };
            
            next();
        } catch (tokenError) {
            if (tokenError.message.includes('expired')) {
                return res.status(401).json({
                    error: 'Token expired',
                    message: 'Access token has expired'
                });
            } else if (tokenError.message.includes('Invalid token')) {
                return res.status(403).json({
                    error: 'Invalid token',
                    message: 'Token is malformed or invalid'
                });
            } else if (tokenError.message.includes('not active')) {
                return res.status(403).json({
                    error: 'Token not active',
                    message: 'Token is not active yet'
                });
            } else if (tokenError.message.includes('Invalid token type')) {
                return res.status(403).json({
                    error: 'Invalid token type',
                    message: 'Expected access token'
                });
            } else if (tokenError.message.includes('signature')) {
                return res.status(403).json({
                    error: 'Invalid token signature',
                    message: 'Token signature verification failed'
                });
            } else {
                return res.status(403).json({
                    error: 'Token verification failed',
                    message: tokenError.message || 'Unknown token error'
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Authentication process failed'
        });
    }
}