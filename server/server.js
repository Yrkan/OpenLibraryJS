const express = require("express");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// connect to database
connectDB();

// Body Parser for JSON
app.use(express.json({ extended: false }));

app.get("/", (req, res) => {
  res.send("hi");
});
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
