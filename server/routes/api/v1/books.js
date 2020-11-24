const { Router } = require("express");
const { check } = require("express-validator");
const { authAdmin } = require("../../../middlewears/auth");

const router = Router();

router.post(
  "/",
  [
    authAdmin,
    [
      check("name", "title is required").notEmpty(),
      check("author", "author is required").notEmpty(),
      check("genre", "genre is an array of strings").isArray(),
    ],
  ],
  async (req, res) => {}
);
router.get("/", (req, res) => {
  res.send("books");
});

module.exports = router;
