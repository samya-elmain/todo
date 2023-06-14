import * as dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { connectToDatabase } from "./database";
import taskRouter from "./task.routes";
import userRouter from "./user.routes";

// Load environment variables from the .env file, where the ATLAS_URI is configured
dotenv.config();

const { ATLAS_URI } = process.env;

if (!ATLAS_URI) {
  console.error("No ATLAS_URI environment variable has been defined in config.env");
  process.exit(1);
}

connectToDatabase(ATLAS_URI)
  .then(() => {
    const app = express();
    app.use(cors());

    // Middleware
    app.use(express.json());

    // Routes
    
    app.use("/users", userRouter);
    app.use("/users", taskRouter);

    const port = process.env.PORT || 5200;

    // Start the Express server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}...`);
 
    });
  })
  .catch((error) => console.error(error));
