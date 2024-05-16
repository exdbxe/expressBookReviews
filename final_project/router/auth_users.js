const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    //returns boolean
    //write code to check is the username is valid
    const user = users.find((user) => user.username === username);
    return !!user;
  };
  
  const authenticatedUser = (username, password) => {
    //returns boolean
    //write code to check if username and password match the one we have in records.
    try {
      const user = users.find(
        (user) => user.username === username && user.password === password
      );
      return !!user;
    } catch (error) {
      console.error("Error authenticating user:", error);
      return false;
    }
  };
  
  // only registered users can login
  regd_users.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Missing required fields (username or password)" });
    }
  
    try {
      if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign(
          { username }, // JWT payload with username
          "exd",
          { expiresIn: 60 * 60 } // Expires in 1 hour
        );
  
        req.session.authorization = { accessToken, username };
  
        return res.status(200).json({ message: "User successfully logged in", token: accessToken });
      } else {
        return res.status(401).json({ message: "Invalid username or password" });
      }
    } catch (error) {
      console.error("Error logging in user:", error);
      return res.status(500).json({ message: "Error during login" });
    }
  });
  
  // Add a book review with authorization
  regd_users.put("/auth/review/:isbn", async (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
  
    if (!review) {
      return res.status(400).json({ message: "Missing review text" });
    }
  
    try {
      const username = req.session.authorization?.username;
      if (!username) {
        return res.status(401).json({ message: "Unauthorized access" });
      }
  
      const book = books[isbn];
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      book.reviews[username] = review;
      return res.status(200).json({ message: "Review added", reviews: book.reviews });
    } catch (error) {
      console.error("Error adding review:", error);
      return res.status(500).json({ message: "Error during review addition" });
    }
  });
  
  // Remove a book review with authorization
  regd_users.delete("/auth/review/:isbn", async (req, res) => {
    const isbn = req.params.isbn;
  
    try {
      const username = req.session.authorization?.username;
      if (!username) {
        return res.status(401).json({ message: "Unauthorized access" });
      }
  
      const book = books[isbn];
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      delete book.reviews[username];
      return res.status(200).json({ message: "Review deleted", reviews: book.reviews });
    } catch (error) {
      console.error("Error deleting review:", error);
      return res.status(500).json({ message: "Error during review deletion" });
    }
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
