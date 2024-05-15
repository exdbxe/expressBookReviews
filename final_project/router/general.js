const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

function doesExist(username) {
    return users.some(user => user.username === username.toLowerCase()); // Case-insensitive search
  }

public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username?.trim(); // Handle potential empty or whitespace usernames
  const password = req.body.password;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: "Missing required fields (username or password)" }); // 400 Bad Request
    }

    if (doesExist(username)) {
      return res.status(409).json({ message: "Username already exists" }); // 409 Conflict
    }

    users.push({ username, password }); // Add user data
    return res.status(201).json({ message: "User successfully registered" }); // 201 Created
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Error during registration" }); // 500 Internal Server Error
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    //Write your code here
    res.send(JSON.stringify(books,null,4));
  });
  
// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
    const isbn = req.params.isbn;
  
    try {
      // Find book by ISBN (adapt based on your data structure)
      const book = (
        // Approach 1: Object with ISBN as properties (if suitable)
        books.hasOwnProperty(isbn) ? books[isbn] :
  
        //Array of book objects
    books.find(book => book.ISBN === books) // Replace 'ISBN' with actual property name
    );
  
    if (book) {
        return res.status(200).json({ book }); // Success - return book data
    } else {
        return res.status(404).json({ message: "Book not found" }); // Not found
    }
} catch (error) {
    console.error("Error fetching book details:", error);
    return res.status(500).json({ message: "Error retrieving book details" }); // Internal error
}
});
  
// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
    const authorName = req.params.author;
    const matchingBooks = []; // Array to store matching books
  
    try {
      // Check if books is an object or array
      if (Array.isArray(books)) {
        // Iterate through books array
        for (let i = 0; i < books.length; i++) {
          const book = books[i];
          if (book.author === authorName) {
            matchingBooks.push(book);
          }
        }
      } else {
        // Iterate through books object keys and values
        for (const key in books) {
          const book = books[key];
          if (book.author === authorName) {
            matchingBooks.push(book);
          }
        }
      }
  
      if (matchingBooks.length > 0) {
        return res.status(200).json({ books: matchingBooks }); // Success - return matching books
      } else {
        return res.status(404).json({ message: "No books found by author" }); // Not found
      }
    } catch (error) {
      console.error("Error fetching books by author:", error);
      return res.status(500).json({ message: "Error retrieving books" }); // Internal error
    }
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title.toLowerCase(); // Perform case-insensitive search

  try {
    // Find books by title (adapt based on your data structure)
    let filteredBooks;

    if (Array.isArray(books)) {
      // Use filter for arrays
      filteredBooks = books.filter(book => book.title.toLowerCase() === title);
    } else {
      // Handle object structure
      filteredBooks = [];
      for (const key in books) {
        const book = books[key];
        if (book.title && book.title.toLowerCase().includes(title.toLowerCase())) { // Search within title (partial match)
          filteredBooks.push(book);
        }
      }
      if (filteredBooks.length === 0) {
        console.warn("No exact title matches found in object structure. Consider implementing a more robust search algorithm for partial matches or different property names.");
      }
    }

    if (filteredBooks.length > 0) {
      return res.status(200).json({ books: filteredBooks }); // Success - return books array
    } else {
      return res.status(404).json({ message: "No books found by title" }); // Not found
    }
  } catch (error) {
    console.error("Error fetching books by title:", error);
    return res.status(500).json({ message: "Error retrieving books" }); // Internal error
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  try {
    // Check if books data is available and isbn exists
    if (!books || !books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if reviews property exists
    if (!books[isbn].reviews) {
      return res.status(404).json({ message: "No reviews found for this book" });
    }

    return res.status(200).json({ reviews: books[isbn].reviews });
  } catch (error) {
    console.error("Error fetching book reviews:", error);
    return res.status(500).json({ message: "Error retrieving reviews" }); // Internal error
  }
});

module.exports.general = public_users;
