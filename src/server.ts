import express from "express";

const app = express();

const PORT = 3000;

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Takaful API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});