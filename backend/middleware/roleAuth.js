export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // Validate that req exists
            if (!req) {
                console.error("Request object is undefined");
                return res.status(500).json({ error: "Internal server error" });
            }

            // In a real app, you'd extract this from JWT token
            // For now, we'll get it from request body or headers
            const userRole = (req.user && req.user.role) || 
                            (req.body && req.body.userRole) || 
                            (req.headers && req.headers['x-user-role']);
            console.log(userRole);
            
            if (!userRole) {
                console.log("No user role found in request");
                return res.status(401).json({ error: "User role not found" });
            }

            if (Array.isArray(allowedRoles)) {
                if (!allowedRoles.includes(userRole)) {
                    console.log(`Role ${userRole} not in allowed roles:`, allowedRoles);
                    return res.status(403).json({ error: "Access denied for this role" });
                }
            } else {
                if (userRole !== allowedRoles) {
                    console.log(`Role ${userRole} does not match required role: ${allowedRoles}`);
                    return res.status(403).json({ error: "Access denied for this role" });
                }
            }

            req.userRole = userRole;
            // console.log(`User role ${userRole} authorized for route`);
            next();
        } catch (error) {
            console.error("Role authentication error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    };
};

export const requireSalesManager = requireRole('salesmanager');
export const requireLoanCoordinator = requireRole('loancoordinator');
export const requireLoanAdministrator = requireRole('loanadministrator');
export const requireStaff = requireRole(['salesmanager', 'loancoordinator', 'loanadministrator']);
export const requireAdmin = requireRole('admin');
export const requireBuilder = requireRole('builder');