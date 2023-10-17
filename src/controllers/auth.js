import { db } from "../../connect.js";
import bcrypt from "bcryptjs";
import { customPasswordValidation } from "./validator.js";

// Login function
export const Login = (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT id, name, email, password, roleid, status, CONVERT(profileImage USING utf8) as profileImage, full_days FROM user WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Failed to fetch data from database" });
      return;
    }

    if (results.length === 0) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const user = results[0];

    // Compare hashed password with entered password
    bcrypt.compare(password, user.password, (bcryptErr, match) => {
      if (bcryptErr) {
        console.error("Error comparing passwords:", bcryptErr.message);
        res.status(500).json({ error: "Authentication error" });
        return;
      }

      if (!match) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      res.json(user);
    });
  });
};

// Register function
export const Register = (req, res) => {
  const { email, password, name, role } = req.body;

  // Generate a salt to use for hashing
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.error("Error generating salt:", err.message);
      res.status(500).json({ error: "Failed to hash password" });
      return;
    }

    // Hash the password using the generated salt
    bcrypt.hash(password, salt, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err.message);
        res.status(500).json({ error: "Failed to hash password" });
        return;
      }

      db.query(
        "INSERT INTO user (email, password, name, roleid) VALUES (?, ?, ?, ?)",
        [email, hashedPassword, name, role],
        (err, results) => {
          if (err) {
            console.error("Error executing query:", err.message);
            res
              .status(500)
              .json({ error: "Failed to fetch data from database" });
            return;
          }

          res.json({ success: true });
        }
      );
    });
  });
};

// update profile function
export const UpdateProfile = async (req, res) => {
  const { id, currentPassword, password, rePassword, profileImage } = req.body;

  // Perform data validation
  if (!id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate data using your validation function
  const { error } = customPasswordValidation(req.body);
  if (error) {
    console.log("Error validating data:", error);
    return res
      .status(400)
      .json({ errors: error.details.map((detail) => detail.message) });
  }

  try {
    let query = "UPDATE user SET "; // Changed from const to let
    const queryParams = [];

    if (password) {
      // Hash the password
      const hashedPassword = await hashPassword(password);
      query += "password = ?, ";
      queryParams.push(hashedPassword);
    }

    if (profileImage) {
      query += "profileImage = ?, ";
      queryParams.push(profileImage);
    }

    // Remove the last comma and space
    query = query.slice(0, -2);

    // Add the WHERE clause
    query += " WHERE id = ?";
    queryParams.push(id);

    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        return res
          .status(500)
          .json({ error: "Failed to update profile in the database" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true });
    });

    // Execute the query
  } catch (err) {
    console.error("Error updating profile:", err.message);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};

// write a function to hash the password using bcrypt and return the hashed password
export const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) reject(err);

      bcrypt.hash(password, salt, (err, hashedPassword) => {
        if (err) reject(err);

        resolve(hashedPassword);
      });
    });
  });
};
