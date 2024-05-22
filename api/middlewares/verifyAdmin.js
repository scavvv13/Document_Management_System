const verifyAdmin = async (req, res, next) => {
  try {
    // Extract user information from the JWT token (replace with your JWT verification logic)
    const decoded = await verifyJWT(req.headers.authorization); // Replace verifyJWT with your implementation
    const user = decoded.user; // Assuming user data is stored in the token

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" }); // Handle missing or invalid token
    }
    req.user = user; // Store the user object for access in route handlers (optional)
    next(); // Continue to the route handler
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" }); // Handle JWT verification errors
  }
};

module.exports = verifyAdmin;
