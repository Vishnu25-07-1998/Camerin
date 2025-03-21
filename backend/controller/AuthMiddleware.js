const jwt = require("jsonwebtoken");
require('dotenv').config();

const AuthMiddleware = (request, response, next) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new Error("Authorization header is missing!");
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            throw new Error("Token is missing!");
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT secret is not defined!");
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        request.user = decodedToken;
        // request.user = { id: decodedToken.id, username: decodedToken.username };
        next();
    } catch (error) {
        response.status(401).json({
            error: error.message || "Invalid request!",
        });
        console.error(error);
    }
};

module.exports = AuthMiddleware;