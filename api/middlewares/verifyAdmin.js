const verifyJWT = require("../utils/authUtils");
const verifyAdmin = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    console.log("Authorization Header:", authorizationHeader); // Debug log

    if (!authorizationHeader) {
      return res
        .status(401)
        .json({ message: "Unauthorized, no token provided" });
    }

    const token = authorizationHeader.split(" ")[1]; // Extract the token
    console.log("Token received:", token); // Debug log
    const decoded = await verifyJWT(token); // Use your JWT verification logic
    console.log("Decoded token:", decoded); // Debug log
    const user = decoded; // Assuming user data is stored in the token

    if (!user || !user.isAdmin) {
      console.log("Unauthorized access attempt"); // Debug log
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user; // Store the user object for access in route handlers
    next(); // Continue to the route handler
  } catch (error) {
    console.error("Error verifying admin:", error); // Debug log
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = verifyAdmin;
