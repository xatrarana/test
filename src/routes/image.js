const express = require("express");
const { getAllImages } = require("../controllers/image");

const router = express.Router();

router.get("/", getAllImages);

module.exports = router;
