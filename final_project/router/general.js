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


// Simulate Axios-style Promise for fetching a book by ISBN
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]); // Resolve the Promise with the book details
    } else {
      reject("ISBN book number not found"); // Reject the Promise if the book is not found
    }
  });
}

// Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn; // Pulling ISBN from the request parameters

  try {
    const bookDetails = await getBookByISBN(isbn); // Wait for the Promise to resolve
    return res.status(200).json(bookDetails); // Send the book details as JSON response
  } catch (error) {
    return res.status(404).json({ message: error }); // Handle error if the book is not found
  }
});



// Function to normalize the author's name (convert to lowercase and remove spaces & hyphens)
function normalizeName(name) {
  return name.toLowerCase().replace(/[\s-]+/g, '');
}

  
// Simulate Axios-style Promise for fetching books by author
function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
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

    // If any books are found, resolve the Promise with the books
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject("No books found by this author");
    }
  });
}

// Route to find books by author using async-await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author; // Extract author from request parameters

  try {
    const booksByAuthor = await getBooksByAuthor(author); // Wait for the Promise to resolve
    return res.status(200).json(booksByAuthor); // Send the list of books by the author as JSON response
  } catch (error) {
    return res.status(404).json({ message: error }); // Handle error if no books are found
  }
});


// Simulate Axios-style Promise for fetching books by title
function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
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

    // If any books are found, resolve the Promise with the books
    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject("No books found with this title");
    }
  });
}

// Route to get books by title using async-await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title; // Extract title from request parameters

  try {
    const booksByTitle = await getBooksByTitle(title); // Wait for the Promise to resolve
    return res.status(200).json(booksByTitle); // Send the list of books with the title as JSON response
  } catch (error) {
    return res.status(404).json({ message: error }); // Handle error if no books are found
  }
});

// Simulate Axios-style Promise for fetching reviews by ISBN
function getReviewsByISBN(isbn) {
  return new Promise((resolve, reject) => {
    // Check if the book with the given ISBN exists
    if (books[isbn]) {
      const reviews = books[isbn].reviews;  // Access the reviews object for the book

      // Check if the reviews object is empty (no reviews)
      if (Object.keys(reviews).length === 0) {
        resolve({ message: "Successfully processed the request, but there are no reviews." });
      } else {
        resolve({ reviews: reviews });  // Resolve the Promise with the reviews
      }
    } else {
      reject("404 Error - No book found with the given ISBN");
    }
  });
}

// Route to get reviews by ISBN using async-await
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;  // Extract ISBN from the request parameters

  try {
    const reviews = await getReviewsByISBN(isbn);  // Wait for the Promise to resolve
    return res.status(200).json(reviews);  // Send the reviews as JSON response
  } catch (error) {
    return res.status(404).json({ message: error });  // Handle error if the book is not found
  }
});


module.exports.general = public_users;
