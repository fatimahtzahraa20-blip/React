import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

// Mount all auth routes under /auth
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("JWT Auth API is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});