const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // To generate random secret keys
const bodyParser = require('body-parser'); // Require body-parser middleware
let books = require('./booksdb.js'); // Assuming booksdb.js exports a books object
const regd_users = express.Router();

// Use body-parser middleware to parse JSON bodies
regd_users.use(bodyParser.json()); // Parse JSON data
regd_users.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data

// In-memory store for users (dynamic, not hardcoded)
let users = [];

// Function to check if a username is already registered
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Function to authenticate a user (check username and password)
const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username);
  return user && user.password === password; // Check if the username and password match
};

// Route to register a new user (adds to the in-memory store)
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if the username already exists
  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists." });
  }

  // Generate a secret key for the user
  const userSecretKey = crypto.randomBytes(32).toString('hex');

  // Add the new user to the in-memory store
  users.push({
    username: username,
    password: password,
    secretKey: userSecretKey
  });

  return res.status(201).json({ message: "User registered successfully!" });
});

// Route to log in an existing user
regd_users.post("/customer/login", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Authenticate the user
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Find the user to get their secret key
  const user = users.find(user => user.username === username);
  const userSecretKey = user.secretKey;

  // Generate a JWT token (valid for 1 hour) using the user's secret key
  const accessToken = jwt.sign({ username }, userSecretKey, { expiresIn: '1h' });

  // Return the token
  return res.status(200).json({
    message: "Login successful!",
    token: accessToken
  });
});

// Middleware to authenticate users
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  // Check if a token was provided
  if (!token) {
    return res.status(403).json({ message: "User not authenticated." });
  }

  // Decode the token to extract the username (this does not verify the token)
  let decodedToken;
  try {
    decodedToken = jwt.decode(token); // Decode the token to get the username
  } catch (err) {
    return res.status(403).json({ message: "Invalid token." });
  }

  // Get the username from the token
  const username = decodedToken.username;

  // Find the user and retrieve their secret key
  const user = users.find(user => user.username === username);
  if (!user) {
    return res.status(403).json({ message: "User not found." });
  }

  const userSecretKey = user.secretKey;

  // Verify the token using the user's session-specific secret key
  jwt.verify(token, userSecretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    // Attach user info to the request object for later use
    req.user = decoded;
    next(); // Continue to the route handler
  });
};

// Route to view reviews for a specific book by ISBN (any user can access)
regd_users.get("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Check if the book exists by ISBN
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Return the reviews for the book
  const reviews = books[isbn].reviews || {};

  return res.status(200).json({
    message: "Reviews fetched successfully!",
    reviews: reviews
  });
});

// Route to add or modify a book review (only for logged-in users)
regd_users.put("/auth/review/:isbn", authenticateUser, (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user.username; // Get the authenticated user's username

  // Check if the book exists by ISBN
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Initialize reviews for the book if not present
  books[isbn].reviews = books[isbn].reviews || {};

  // Add or update the review for the authenticated user
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: books[isbn].reviews[username] ? "Review updated successfully!" : "Review added successfully!",
    book: books[isbn]
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
