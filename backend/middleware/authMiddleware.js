import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ error: "No token provided" });
    }

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Invalid authorization format" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded; // contains id + role

        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
};
