import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import branchRoutes from "./modules/branches/branch.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import familyRoutes from "./modules/family/routes/family.index.route.js";
import categoryRoutes from "./modules/catalog/categories/category.routes.js";
import itemRoutes from "./modules/catalog/items/item.routes.js";
import templateRoutes from "./modules/parcel/templates/template.routes.js"
import inventoryRoutes from "./modules/inventory/inventories/inventory.routes.js"
import projectRoutes from "./modules/project/projects/project.routes.js";
import distributionRoutes from "./modules/project/distributions/distribution.routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api", familyRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/distributions", distributionRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Takaful API is running",
  });
});

export default app;