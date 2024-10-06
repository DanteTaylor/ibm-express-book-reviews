const express = require('express');
let books = require("./booksdb.js"); // Assuming books is an in-memory object
const public_users = express.Router();

// Function to normalize the author names and book titles (convert to lowercase and remove spaces & hyphens)
function normalizeName(name) {
  return name.toLowerCase().replace(/[\s-]+/g, '');
}

// Simulate asynchronous behavior for fetching all books
async function getBooks() {
  return books;
}

// Simulate asynchronous behavior for fetching a book by ISBN
async function getBookByISBN(isbn) {
  if (books[isbn]) {
    return books[isbn]; // Return the book if found
  } else {
    throw new Error("ISBN book number not found"); // Throw an error if the book is not found
  }
}

// Simulate asynchronous behavior for fetching books by author (with normalization)
async function getBooksByAuthor(author) {
  const normalizedAuthor = normalizeName(author); // Normalize the author name

  // Filter books that match the normalized author's name
  const booksByAuthor = Object.values(books).filter(book =>
    normalizeName(book.author) === normalizedAuthor
  );

  if (booksByAuthor.length > 0) {
    return booksByAuthor; // Return books by the author if found
  } else {
    throw new Error("No books found by this author");
  }
}

// Simulate asynchronous behavior for fetching books by title (with normalization)
async function getBooksByTitle(title) {
  const normalizedTitle = normalizeName(title); // Normalize the title

  // Filter books that match the normalized title
  const booksByTitle = Object.values(books).filter(book =>
    normalizeName(book.title) === normalizedTitle
  );

  if (booksByTitle.length > 0) {
    return booksByTitle; // Return books with the given title if found
  } else {
    throw new Error("No books found with this title");
  }
}

// Simulate asynchronous behavior for fetching reviews by ISBN
async function getReviewsByISBN(isbn) {
  if (books[isbn]) {
    const reviews = books[isbn].reviews;
    if (Object.keys(reviews).length > 0) {
      return reviews; // Return the reviews if they exist
    } else {
      return { message: "No reviews available for this book" };
    }
  } else {
    throw new Error("No book found with the given ISBN");
  }
}

// Route to get the book list using async-await
public_users.get('/', async function (req, res) {
  try {
    const bookList = await getBooks(); // Fetch all books
    return res.status(200).json({ books: bookList });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Route to get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const bookDetails = await getBookByISBN(isbn); // Fetch book by ISBN
    return res.status(200).json(bookDetails);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Route to find books by author using async-await (with normalization)
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const booksByAuthor = await getBooksByAuthor(author); // Fetch books by author
    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Route to get books by title using async-await (with normalization)
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const booksByTitle = await getBooksByTitle(title); // Fetch books by title
    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Route to get reviews by ISBN using async-await
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const reviews = await getReviewsByISBN(isbn); // Fetch reviews by ISBN
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

module.exports.general = public_users;
