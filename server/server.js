const express = require("express");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Body Parser for JSON
app.use(express.json({ extended: false }));

app.get("/", (req, res) => {
  res.send("hi");
});

// Routes
app.use("/api/v1/admins", require("./routes/api/v1/admins"));
app.use("/api/v1/auth", require("./routes/api/v1/auth"));
app.use("/api/v1/authors", require("./routes/api/v1/authors"));
app.use("/api/v1/books", require("./routes/api/v1/books"));
app.use("/api/v1/notes", require("./routes/api/v1/notes"));
app.use("/api/v1/users", require("./routes/api/v1/users"));

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
