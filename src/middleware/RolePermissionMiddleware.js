import jwt from 'jsonwebtoken';

const RolePermissionMiddleware = (allowedRoles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.sendStatus(401);

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.sendStatus(403);

            req.id = decoded.id;
            req.username = decoded.username;
            req.roles = Array.isArray(decoded.role) ? decoded.role : [decoded.role];

            const hasAccess = req.roles.some(role => allowedRoles.includes(role));
            if (!hasAccess) return res.sendStatus(403);

            next();
        });
    };
};

export default RolePermissionMiddleware;
