const Route = require("../model/routes");
const Image = require("../model/image");
const fs = require("fs");
const getPlaceRoute = async (req, res) => {
  try {
    const routes = await Route.find();

    if (!routes) {
      return res
        .status(404)
        .json({ success: false, message: "No data found." });
    }
    return res.status(200).json({ success: true, data: routes });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};
const readData = (path) => {
  try {
    const data = fs.readFileSync(path);
    // Convert the image data to Base64
    const base64Image = Buffer.from(data);
    return base64Image;
  } catch (err) {
    throw err;
  }
};
const processFileUploads = async (files) => {
  let images = [];

  const promises = files.map(async (file) => {
    const fileName = file.originalname;
    console.log(fileName, "from fileName");
    console.log(file.path);
    const imageData = await readData(file.path);

    const image = new Image({
      data: imageData,
      mimeType: file.mimetype,
    });
    const result = await image.save();
    if (!result) {
      console.log("sucess false");
    }
    images.push(result._id);
    console.log("images pushed", images);
  });

  await Promise.all(promises);

  return images;
};
function generateSlug(str) {
  // Remove leading and trailing whitespaces
  const trimmedStr = str.trim();

  // Convert to lowercase
  const lowercaseStr = trimmedStr.toLowerCase();

  // Replace spaces with hyphens
  const slug = lowercaseStr.replace(/\s+/g, "-");

  return slug;
}
const createRoute = async (req, res) => {
  try {
    const { title, wardno } = req.body;
    const images = await processFileUploads(req.files);

    const newRoute = new Route({
      title,
      slug_name: generateSlug(title),
      images: images,
      wardno,
    });

    const routeData = await newRoute.save();
    res.status(201).json({ Routes: routeData });
  } catch (error) {
    console.error("Error creating place:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error: error });
  }
};

module.exports = { getPlaceRoute, createRoute };
