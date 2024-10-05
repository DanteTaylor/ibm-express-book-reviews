const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');  // Added session middleware
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to parse JSON request bodies
app.use(express.json()); 

// Set up express-session middleware
app.use(session({
    secret: 'your_secret_key',  // Replace with a secure secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // In production, use `secure: true` when using HTTPS
}));

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

// Route to login user and generate JWT
app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Check if the username exists
    if (!users[username]) {
        return res.status(404).json({ message: "User not found." });
    }
  
    // Check if the password matches
    if (users[username].password !== password) {
        return res.status(401).json({ message: "Invalid password." });
    }
  
    // Generate JWT token (valid for 1 hour)
    const token = jwt.sign({ username: username }, process.env.JWT_SECRET || "access", { expiresIn: '1h' });
  
    // Store the JWT token in the session
    req.session.authorization = { accessToken: token };
  
    return res.status(200).json({ message: "Login successful!", token: token });
});

// Middleware to protect customer routes (JWT authentication)
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the user has a valid access token
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        // Verify the JWT token
        jwt.verify(token, process.env.JWT_SECRET || "access", (err, user) => {
            if (!err) {
                req.user = user; // Attach user information to the request
                next(); // Proceed to the next middleware or route
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

app.use("/customer", customer_routes);  // Protected customer routes
app.use("/", genl_routes);  // General routes

// Start the server
app.listen(PORT, () => {
    console.log("Server is running on port" + PORT);
});
