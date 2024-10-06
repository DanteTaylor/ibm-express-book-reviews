const express = require('express');
const session = require('express-session');  // Session-based authentication
const bodyParser = require('body-parser');   // Body-parser to handle JSON and form data
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const app = express();
const PORT = process.env.PORT || 8080;

// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Parses URL-encoded data

// Set up express-session middleware for session-based authentication
app.use(session({
    secret: 'your_secret_key',  // Replace with a secure secret key
    resave: false,  // Don't save session if unmodified
    saveUninitialized: false,  // Only save session if something is stored
    cookie: {
        secure: false,  // In production, set to true when using HTTPS
        httpOnly: true,  // Ensure cookies are only sent over HTTP(S), not accessible to client JS
        maxAge: 60 * 60 * 1000  // 1 hour expiration for the session cookie
    }
}));

// Example in-memory user store (we can also import this from auth_users.js if shared)
let users = {};  // Users are dynamically added during registration

// Middleware to protect routes that require authentication (session-based)
const isAuthenticated = (req, res, next) => {
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized, please log in first.' });
    }
};

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

// Route to log in a user (session-based)
app.post('/customer/login', (req, res) => {
    const { username, password } = req.body;
  
    // Check if the username exists
    if (!users[username]) {
        return res.status(404).json({ message: "User not found." });
    }
  
    // Check if the password matches
    if (users[username].password !== password) {
        return res.status(401).json({ message: "Invalid password." });
    }
  
    // Log in the user by setting session variables
    req.session.isLoggedIn = true;
    req.session.username = username;
  
    return res.status(200).json({ message: "Login successful!" });
});

// Route to log out a user (destroy the session)
app.post('/customer/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out.' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.json({ message: 'Logged out successfully.' });
    });
});

// Protect the route for adding/modifying reviews (only logged-in users can access)
app.use("/auth/review", isAuthenticated);  // All POST/PUT routes for /auth/review require login

// Apply customer routes (for authenticated users to add/modify reviews)
app.use("/auth", customer_routes); 

// Apply general routes (open to all users, for viewing reviews)
app.use("/", genl_routes); 

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
