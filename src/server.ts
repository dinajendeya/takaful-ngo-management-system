import app from "./app.js";
import "dotenv/config";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(process.env.DATABASE_URL);
  console.log(`Server running on port ${PORT}`);
});