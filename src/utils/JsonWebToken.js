import jwt from "jsonwebtoken";
import crypto from "crypto";
import 'dotenv/config';

const JWT_CONFIG = {
    ACCESS_TOKEN_EXPIRY: '2m',
    REFRESH_TOKEN_EXPIRY: '7d',
    ALGORITHM: 'HS256',
    ISSUER: process.env.JWT_ISSUER || 'your-app-name',
    AUDIENCE: process.env.JWT_AUDIENCE || 'your-app-users'
};

const validateEnvVars = () => {
    const requiredVars = ['JWT_ACCESS_TOKEN_SECRET', 'JWT_REFRESH_TOKEN_SECRET'];
    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (process.env.JWT_ACCESS_TOKEN_SECRET.length < 32) {
        throw new Error('JWT_ACCESS_TOKEN_SECRET must be at least 32 characters long');
    }

    if (process.env.JWT_REFRESH_TOKEN_SECRET.length < 32) {
        throw new Error('JWT_REFRESH_TOKEN_SECRET must be at least 32 characters long');
    }
};


const generateJTI = () => {
    return crypto.randomBytes(16).toString('hex');
};

const sanitizePayload = (payload) => {
    const sanitized = {};
    const allowedFields = ['id', 'role'];

    for (const field of allowedFields) {
        if (payload[field] !== undefined && payload[field] !== null) {
            // Basic sanitization
            if (typeof payload[field] === 'string') {
                sanitized[field] = payload[field].trim();
            } else {
                sanitized[field] = payload[field];
            }
        }
    }

    return sanitized;
};


export const generateToken = async (userPayload) => {
    try {
        validateEnvVars();

        const sanitizedPayload = sanitizePayload(userPayload);
        const currentTime = Math.floor(Date.now() / 1000);

        // Access token payload dengan security claims
        const accessTokenPayload = {
            ...sanitizedPayload,
            iat: currentTime,
            jti: generateJTI(),
            type: 'access',
            iss: JWT_CONFIG.ISSUER,
            aud: JWT_CONFIG.AUDIENCE
        };

        // Refresh token payload (minimal data untuk security)
        const refreshTokenPayload = {
            ...sanitizedPayload,
            iat: currentTime,
            jti: generateJTI(),
            type: 'refresh',
            iss: JWT_CONFIG.ISSUER,
            aud: JWT_CONFIG.AUDIENCE
        };

        const access_token = jwt.sign(
            accessTokenPayload,
            process.env.JWT_ACCESS_TOKEN_SECRET,
            {
                expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
                algorithm: JWT_CONFIG.ALGORITHM
            }
        );

        const refresh_token = jwt.sign(
            refreshTokenPayload,
            process.env.JWT_REFRESH_TOKEN_SECRET,
            {
                expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
                algorithm: JWT_CONFIG.ALGORITHM
            }
        );

        return {
            access_token,
            refresh_token,
            expires_in: JWT_CONFIG.ACCESS_TOKEN_EXPIRY
        };

    } catch (error) {
        throw new Error(`Token generation failed: ${error.message}`);
    }
};


export const decodeToken = async (token, tokenType = 'access') => {
    try {
        if (!token) {
            throw new Error('Token is required');
        }

        // Validate token format
        if (typeof token !== 'string' || !token.includes('.')) {
            throw new Error('Invalid token format');
        }

        validateEnvVars();

        const secret = tokenType === 'refresh'
            ? process.env.JWT_REFRESH_TOKEN_SECRET
            : process.env.JWT_ACCESS_TOKEN_SECRET;

        const decoded = jwt.verify(token, secret, {
            algorithms: [JWT_CONFIG.ALGORITHM],
            issuer: JWT_CONFIG.ISSUER,
            audience: JWT_CONFIG.AUDIENCE
        });

        // Verify token type
        if (decoded.type !== tokenType) {
            throw new Error(`Invalid token type. Expected ${tokenType}, got ${decoded.type}`);
        }

        return decoded;

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        } else if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token has expired');
        } else if (error instanceof jwt.NotBeforeError) {
            throw new Error('Token not active yet');
        } else {
            throw new Error(`Token verification failed: ${error.message}`);
        }
    }
};

export const refreshAccessToken = async (refreshToken) => {
    try {
        const decoded = await decodeToken(refreshToken, 'refresh');
        
        // Get fresh user data (you might want to fetch from database)
        const userPayload = {
            id: decoded.id,
        };
        
        // Generate new access token only
        const accessTokenPayload = {
            ...userPayload,
            iat: Math.floor(Date.now() / 1000),
            jti: generateJTI(),
            type: 'access',
            iss: JWT_CONFIG.ISSUER,
            aud: JWT_CONFIG.AUDIENCE
        };
        
        const access_token = jwt.sign(
            accessTokenPayload,
            process.env.JWT_ACCESS_TOKEN_SECRET,
            {
                expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
                algorithm: JWT_CONFIG.ALGORITHM
            }
        );
        
        return {
            access_token,
            expires_in: JWT_CONFIG.ACCESS_TOKEN_EXPIRY
        };
        
    } catch (error) {
        throw new Error(`Token refresh failed: ${error.message}`);
    }
};