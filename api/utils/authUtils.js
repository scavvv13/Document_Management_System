const jwt = require("jsonwebtoken");
require("dotenv").config();
const verifyJWT = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT verification error:", err); // Debug log
        reject(err);
      } else {
        console.log("JWT verified successfully:", decoded); // Debug log
        resolve(decoded);
      }
    });
  });
};

module.exports = verifyJWT;
