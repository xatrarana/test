const express = require("express");
const { deleteUserById, getUserById } = require("../controllers/user");
const verifyToken = require("../middlewares/verifyToken");
const { createRoute, getPlaceRoute } = require("../controllers/transport");
const upload = require("../middlewares/FileUpload");

const router = express.Router();

router.get("/", getPlaceRoute);
router.post("/create", upload.array("images", 10), createRoute);
router.get("/create", (req, res) => {
  res.render("route");
});

module.exports = router;
