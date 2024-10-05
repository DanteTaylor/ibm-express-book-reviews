const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Get the list of books available
  // Object is automatically converted to a JSON string before being sent as a response.
  return res.status(200).json({ books });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Pulling ISBN from the request parameters
  
  // Book has an object with ISBN as keys
  if (books[isbn]) { // Check if the book exists with the given ISBN
    return res.status(200).json(books[isbn]); // Return the book details
  } else {
    return res.status(404).json({message: "ISBN book number not found"});
  }
});

// Function to normalize the author's name (convert to lowercase and remove spaces & hyphens)
function normalizeName(name) {
  return name.toLowerCase().replace(/[\s-]+/g, '');
}

  
// Route to find books by author (handles variations like spaces or hyphens)
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author; // Extract author from request parameters
  
  // Normalize the author name from the request
  const normalizedAuthor = normalizeName(author);

  // Get all the keys (ISBNs) of the 'books' object
  const allBookKeys = Object.keys(books); 

  // Create an array to hold books that match the normalized author's name
  const booksByAuthor = [];

  // Iterate through the books object to find books that match the normalized author name
  allBookKeys.forEach(isbn => {
    const bookAuthor = normalizeName(books[isbn].author); // Normalize stored author name
    if (bookAuthor === normalizedAuthor) {
      booksByAuthor.push(books[isbn]); // Add matching books to the array
    }
  });

  // If any books are found, return them
  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
