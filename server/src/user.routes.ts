import * as express from "express";
import * as mongodb from "mongodb";
import { collections } from "./database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const userRouter = express.Router({ mergeParams: true });
userRouter.use(express.json());

userRouter.post("/register", async (req, res) => {
  try {
    const user = req.body;
    const existingUser = await collections.users.findOne({ email: user.email });

    if (existingUser) {
      res.status(409).send("User with this email already exists.");
    } else {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;

      const result = await collections.users.insertOne(user);

      if (result.acknowledged) {
        res.status(201).send({ userId: result.insertedId }); // Return the user's ID instead of the token
      } else {
        res.status(500).send("Failed to register a new user.");
      }
    }
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});


userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await collections.users.findOne({ email });

    if (!user) {
      res.status(401).send("Invalid credentials.");
    } else {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid && user) {
        const token = jwt.sign({ userId: user._id }, "secretKey", { expiresIn: "1h" });
        res.status(200).send({ token});
      } else {
        res.status(401).send("Invalid credentials.");
      }
    }
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});


userRouter.post("/logout", (req, res) => {
  try {
    const authorizationHeader = req.headers["authorization"];
    if (authorizationHeader) {
      const token = authorizationHeader.split(" ")[1]; // Extract the token from the header

      // Perform any necessary token validation or invalidation steps here
      // For example, you can blacklist the token or remove it from the client-side storage

      // Respond with a success message
      res.status(200).json({ message: "Logged out successfully" });
    } else {
      // If no token is provided in the header, you can consider it as an invalid request
      res.status(400).json({ message: "Invalid request" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred during logout" });
  }
});
  

export default userRouter;
