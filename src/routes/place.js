const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const {
  getAllPlaces,
  createPlace,
  rating,
  getImageById,
  getPlaceById,
  nepaliData,
  deletePlace,
} = require("../controllers/place");
const { Translate } = require("../controllers/translate");
const apiKeyVerify = require("../middlewares/apiKeyVerify");
const upload = require("../middlewares/FileUpload");
const router = express.Router();

router.get("/en", getAllPlaces);
router.get("/ne", nepaliData);

router.post("/create", upload.array("images", 10), createPlace);
router.get("/image/:id", getImageById);
router.post("/:id/rate", rating);
router.get("/place/:id", getPlaceById);
router.post("/delete/", deletePlace);
module.exports = router;
