const { Router } = require("express");

const router = Router();

router.get("/", (req, res) => {
  res.send("authors");
});

module.exports = router;
