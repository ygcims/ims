import express from "express";
import bodyParser from "body-parser";
import authRouter from "./routes/auth.js";
import dataRouter from "./routes/dataManagement.js";
import leadRouter from "./routes/leads.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 6000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.use(bodyParser.json({ limit: "10mb" }));

app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// routes
app.use("/api/auth", authRouter);
app.use("/api/datamanagement", dataRouter);
app.use("/api/leads", leadRouter);

// Start Express server once the database is connected
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
