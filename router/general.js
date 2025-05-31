const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBooksAsync = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books);
    }, 100);
  });
};

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully" });
});

public_users.get('/',async function (req, res) {
  try {
    const allBooks = await getBooksAsync();
    return res.status(200).json(allBooks);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

const getBookByIsbnAsync = (isbn) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found"));
      }
    }, 100);
  });
};

public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const book = await getBookByIsbnAsync(isbn);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});
  
const getBooksByAuthorAsync = (author) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const matchingBooks = [];
      for (let isbn in books) {
        if (books[isbn].author === author) {
          matchingBooks.push(books[isbn]);
        }
      }
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject(new Error("No books found by this author"));
      }
    }, 100);
  });
};

public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const booksByAuthor = await getBooksByAuthorAsync(author);
    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

const getBooksByTitleAsync = (title) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const matchingBooks = [];
      for (let isbn in books) {
        if (books[isbn].title === title) {
          matchingBooks.push(books[isbn]);
        }
      }
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject(new Error("No books found with this title"));
      }
    }, 100); // simula latencia 100ms
  });
};

public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const booksByTitle = await getBooksByTitleAsync(title);
    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
