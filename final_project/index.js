const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json()); // Middleware to parse JSON request bodies
let users = {};  // Example in-memory user store

// Route to register a new user
app.post('/register', (req, res) => {
    const { username, password } = req.body;
  
    // Check if both username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // Check if the username already exists
    if (users[username]) {
      return res.status(409).json({ message: "Username already exists." });
    }
  
    // Register the new user (Note: In production, passwords should be hashed)
    users[username] = { password: password };
  
    return res.status(201).json({ message: "User registered successfully!" });
  });
  

app.use("/customer/auth/*", function auth(req,res,next){
// Check if user is logged in and has valid access token
if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        // Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next(); // Proceed to the next middleware
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});
 

app.use("/customer", customer_routes);
app.use("/", genl_routes);
app.listen(PORT,()=>console.log("Server is running " + PORT));




