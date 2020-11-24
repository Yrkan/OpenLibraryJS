const { Router } = require("express");
const { check } = require("express-validator");
const {
  INTERNAL_SERVER_ERROR,
  INVALID_CREDENTIALS,
  UNAUTHORIZED_ACTION,
} = require("../../../const/errors");
const { authAdmin } = require("../../../middlewears/auth");
const Admin = require("../../../models/Admin");
const Author = require("../../../models/Author");

const router = Router();

// @Endpoint:       POST /api/v1/author/
// @Description:    Create a new Author
// @Access:         Private
router.post(
  "/",
  [authAdmin, [check("name", "name is required").notEmpty()]],
  async (req, res) => {
    try {
      // Bad Request handeling
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      //Check if the admin has create priviliges
      const loggedAdmin = await Admin.findById(req.Admin.id);
      if (!loggedAdmin) {
        res.status(401).json(INVALID_CREDENTIALS);
      }
      // Check if admin has create permission
      if (!loggedAdmin.permissions.create) {
        res.status(401).json(UNAUTHORIZED_ACTION);
      }

      const { name, birthYear, deathYear, summary, imgUrl, books } = req.body;
      const newAuthor = new Author({
        name,
      });
      if (birthYear) {
        newAuthor.birthYear = birthYear;
      }
      if (deathYear) {
        newAuthor.deathYear = deathYear;
      }
      if (summary) {
        newAuthor.summary = summary;
      }
      if (imgUrl) {
        newAuthor.imgUrl = imgUrl;
      } else {
        newAuthor.imgUrl =
          "https://static.thenounproject.com/png/556468-200.png";
      }
      if (books) {
        newAuthor.books = books;
      }

      newAuthor.save();
      return res.json(newAuthor);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json(INTERNAL_SERVER_ERROR);
    }
  }
);

router.get("/", (req, res) => {
  res.send("authors");
});

module.exports = router;
