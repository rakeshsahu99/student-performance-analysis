// export const allowRoles = (...roles) => {
//     return (req, res, next) => {
//         if (!roles.includes(req.user.role)) {
//             return res.status(403).json({ error: "Access denied" });
//         }
//         next();
//     };
// };

// // Generic role-based middleware
export const allowRoles = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            const userRole = req.user?.role?.trim().toLowerCase();

            if (!userRole) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    error: `Access denied for role: ${userRole}`,
                });
            }

            next();
        } catch (err) {
            return res.status(500).json({ error: "Server error" });
        }
    };
};

export const isAdmin = allowRoles("admin");
export const isTeacher = allowRoles("teacher");
export const isStudent = allowRoles("student");
export const isAdminOrTeacher = allowRoles("admin", "teacher");