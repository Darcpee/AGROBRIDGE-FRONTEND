const jwt =require("jsonwebtoken");
const User = require("../model/user");
const blacklistedTokens = require("../AUTH/blacklist");

exports.authenticateToken = async (req, res, next) =>{
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];
    console.log("token", token);
    console.log("JWT_SECRET in authmiddleware", process.env.JWT_SECRET);
    console.log("header recieved", authHeader);

    if (!token) {
        return res.status(401).json({ message: "Access token missing" });
    }

    //  CHECK BLACKLIST HERE (IMPORTANT)
  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ message: "Token invalidated" });
  }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}