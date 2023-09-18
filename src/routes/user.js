const express = require("express");
const { deleteUserById, getUserById } = require("../controllers/user");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

router.get("/", verifyToken, getUserById);
router.delete("/delete", verifyToken, deleteUserById);

module.exports = router;
