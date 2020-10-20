const { Router } = require("express");

const router = Router();
const Admins = require("../../../models/Admins");

router.get("/", async (req, res) => {
  const adminsList = await Admins.find({});
  res.json(adminsList);
});

module.exports = router;
