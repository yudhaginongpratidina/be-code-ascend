const RolePermissionMiddleware = (allowedRoles = []) => {
    return (req, res, next) => {
        const token = req.token;
        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        const userRole = token.role;
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
        }

        next();
    };
};

export default RolePermissionMiddleware;