const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if username exists
    return users.some((user) => user.username === username);
  };
  
  const authenticatedUser = (username, password) => {
    // Check username and password match registered user
    return users.some(
      (user) => user.username === username && user.password === password
    );
  };
  
  // Login route (POST /login)
  regd_users.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }
  
    if (authenticatedUser(username, password)) {
      const accessToken = jwt.sign({ username }, "access", { expiresIn: 60 * 60 }); // Expires in 1 hour
      req.session.authorization = { accessToken, username };
      return res.status(200).json({ message: "User successfully logged in", token: accessToken });
    } else {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  });
  
  // Add book review route (PUT /auth/review/:isbn)
  regd_users.put("/auth/review/:isbn", async (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.session.authorization?.username;
  
    if (!username) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
  
    if (!review) {
      return res.status(400).json({ message: "Missing review text" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: `ISBN ${isbn} not found` });
    }
  
    books[isbn].reviews = books[isbn].reviews || {}; // Initialize reviews if not present
    books[isbn].reviews[username] = review;
  
    return res.status(200).json({ message: "Review added/updated", reviews: books[isbn].reviews });
  });
  
  // Delete book review route (DELETE /auth/review/:isbn)
  regd_users.delete("/auth/review/:isbn", async (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;
  
    if (!username) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: `ISBN ${isbn} not found` });
    }
  
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found" });
    }
  
    delete books[isbn].reviews[username];
  
    return res.status(200).json({ message: "Review deleted" });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
