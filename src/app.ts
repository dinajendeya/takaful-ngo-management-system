import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import branchRoutes from "./modules/branches/branch.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import familyRoutes from "./modules/family/routes/family.route.js";
import familyRequestRoutes from "./modules/family/routes/family-request.route.js";
import familyAuthRoutes from "./modules/family/routes/family-auth.route.js";

import categoryRoutes from "./modules/catalog/categories/category.routes.js";
import itemRoutes from "./modules/catalog/items/item.routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/family-auth", familyAuthRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/families", familyRoutes);
app.use("/api/family-requests", familyRequestRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/items", itemRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Takaful API is running",
  });
});

export default app;