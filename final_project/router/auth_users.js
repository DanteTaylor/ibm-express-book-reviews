const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); // Assuming booksdb.js exports a books object
const regd_users = express.Router();

let users = [];

// Function to check if a username is valid (does not already exist)
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Function to authenticate a user (check username and password)
const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username);
  return user && user.password === password; // Check if the username and password match
};

// Only registered users can login
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

  // Generate a JWT token (valid for 1 hour)
  const accessToken = jwt.sign({ username }, "access_secret_key", { expiresIn: '1h' });

  // Return the token
  return res.status(200).json({
    message: "Login successful!",
    token: accessToken
  });
});

// Add a book review (only for authenticated users)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  // Check if a token was provided
  if (!token) {
    return res.status(403).json({ message: "User not authenticated." });
  }

  // Verify the token
  jwt.verify(token, "access_secret_key", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    // Extract review from the request body
    const { review } = req.body;
    const isbn = req.params.isbn;

    // Check if the book exists by ISBN
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found." });
    }

    // Add or update the review for the authenticated user
    books[isbn].reviews = books[isbn].reviews || {};
    books[isbn].reviews[user.username] = review;

    return res.status(200).json({
      message: "Review added/updated successfully!",
      book: books[isbn]
    });
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
