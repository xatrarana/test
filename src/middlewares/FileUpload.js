const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname + "../../public/images")); // Specify the directory where the files will be stored
  },
  filename: function (req, file, cb) {
    const originalName = file.originalname;
    const uniqueFilename = originalName;
    cb(null, uniqueFilename); // Set the file name as a unique filename with the original extension
  },
});

// Create the multer middleware
const upload = multer({ storage: storage });

module.exports = upload;
