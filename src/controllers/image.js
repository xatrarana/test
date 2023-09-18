const path = require("path");
const fs = require("fs");

const getAllImages = async (req, res) => {
  const imagesDirectory = path.join(__dirname, "../../public/images");

  fs.readdir(imagesDirectory, (err, files) => {
    if (err) {
      console.error("Error reading images directory:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Filter out non-image files
    const imageFiles = files
      .filter((file) => {
        const extension = path.extname(file).toLowerCase();
        return (
          extension === ".jpg" || extension === ".jpeg" || extension === ".png"
        );
      })
      .map((file) => `/images/${file}`);

    res.json({ images: imageFiles });
  });
};

module.exports = { getAllImages };
