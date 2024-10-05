const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Simulate Axios-style Promise for fetching books
function getBooks() {
  return new Promise((resolve, reject) => {
    if (books) {
      resolve(books); // Resolve the Promise if books exist
    } else {
      reject("Books data not available"); // Reject if there's an error
    }
  });
}

// Get the book list using async-await
public_users.get('/', async function (req, res) {
  try {
    const bookList = await getBooks(); // Wait for the Promise to resolve
    return res.status(200).json({ books: bookList }); // Send the books list as JSON response
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books: " + error });
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Pulling ISBN from the request parameters
  
  // Book has an object with ISBN as keys
  if (books[isbn]) { // Check if the book exists with the given ISBN
    return res.status(200).json(books[isbn]); // Return the book details
  } 
  else {
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
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title; // Extract title from request parameters
  
  // Normalize the title from the request
  const normalizedTitle = normalizeName(title);

  // Get all the keys (ISBNs) of the 'books' object
  const allBookKeys = Object.keys(books); 

  // Create an array to hold books that match the normalized title
  const booksByTitle = [];

  // Iterate through the books object to find books that match the normalized title
  allBookKeys.forEach(isbn => {
    const bookTitle = normalizeName(books[isbn].title); // Normalize stored title
    if (bookTitle === normalizedTitle) {
      booksByTitle.push(books[isbn]); // Add matching books to the array
    }
  });

  // If any books are found, return them
  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});


// Get reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;  // Extract ISBN from the request parameters

  // Check if the book with the given ISBN exists
  if (books[isbn]) {
    const reviews = books[isbn].reviews;  // Access the reviews object for the book

    // Check if the reviews object is empty (no reviews)
    if (Object.keys(reviews).length === 0) {
      return res.status(200).json({ message: "Successfully processed the request, but there are no reviews." });
    }

    // If reviews exist, return them with a 200 status code
    return res.status(200).json({ reviews: reviews });
    
  } else {
    // If the book with the given ISBN is not found, return 404
    return res.status(404).json({ message: "404 Error - No book not found." });
  }
});

module.exports.general = public_users;
