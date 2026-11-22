import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import branchRoutes from "./modules/branches/branch.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/branches", branchRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Takaful API is running",
  });
});


export default app;