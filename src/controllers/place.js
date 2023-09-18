const Image = require("../model/image");
const Place = require("../model/place");
const cache = require("memory-cache");
const fs = require("fs");
const path = require("path");
const placedata = {
  title: "Example Place",
  slug_name: "example-place",
  description: "This is an example place.",
  location: "Janduri pan",
  image: ["/images/image-url-1.jpg", "/images/image-url-2.jpg"],
  category: "cultural",
  coordinates: {
    type: "Point",
    coordinates: [27.58623, 85.56278],
  },
};
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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

const getPlaceById = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "place id is required." });
  }

  try {
    // Check if the response is in the cache
    const cachedResponse = cache.get(`place_${id}`);

    if (cachedResponse) {
      return res.status(200).json({ success: true, place: cachedResponse });
    }

    const place = await Place.findById({ _id: id });
    if (!place) {
      return res
        .status(400)
        .json({ success: false, message: "no place found with this id." });
    }

    // Store the place in the cache
    cache.put(`place_${id}`, place, 60000); // Cache for 60 seconds (60000 milliseconds)

    return res.status(200).json({ success: true, place: place });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
};

const nepaliData = async (req, res) => {
  const filePath = path.join(__dirname, "../../config/data.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal Server Error", err });
    }
    const jsonData = JSON.parse(data);
    res.status(200).json({
      success: true,
      message: "Places data fetched successfully",
      status: 200,
      places: jsonData,
      timestamp: new Date().toISOString(),
    });
  });
};

const getAllPlaces = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const totalCount = await Place.countDocuments({});
    if (page && limit) {
      // If both page and limit are provided, fetch paginated results
      const skip = (page - 1) * limit;
      const places = await Place.find().skip(skip).limit(limit);
      const shuffledPlaces = shuffleArray(places);
      // Calculate metadata for pagination
      const currentPage = parseInt(page, 10);
      const totalPages = Math.ceil(totalCount / limit);
      res.setHeader("Cache-Control", "public, max-age=60"); // Cache for 60 seconds
      //res.json({ success:true, cod:"200",places:shuffledPlaces,totalCount });
      res.status(200).json({
        success: true,
        message: "Places data fetched successfully",
        status: 200,
        places: shuffledPlaces,
        totalCount,
        currentPage,
        totalPages,
        limit,
        timestamp: new Date().toISOString(),
      });
    } else {
      // If page and limit are not provided, fetch all the places
      const places = await Place.aggregate([{ $sample: { size: 9999999 } }]);
      const shuffledPlaces = shuffleArray(places);

      res.status(200).json({
        success: true,
        message: "Places data fetched successfully",
        status: 200,
        places: shuffledPlaces,
        totalCount,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error retrieving places:", error);
    res.status(500).json({ success: false, error: "Place not found" });
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

const createPlace = async (req, res) => {
  try {
    const {
      title,
      wardno,
      description,
      location,
      latitude,
      longitude,
      category,
    } = req.body;
    const images = await processFileUploads(req.files);

    const newPlace = new Place({
      title,
      slug_name: generateSlug(title),
      description,
      images: images,
      location,
      wardno,
      category,
      coordinates: {
        type: "Point",
        coordinates: [latitude, longitude],
      },
    });

    const createdPlace = await newPlace.save();
    req.flash("success", "Places created successfully.");
    res.status(201).redirect("/places");
  } catch (error) {
    console.error("Error creating place:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error: error });
  }
};

const getImageById = async (req, res) => {
  const id = req.params.id;
  console.log("id", id);

  try {
    // Check if the response is in the cache
    const cachedResponse = cache.get(`image_${id}`);

    if (cachedResponse) {
      res.set("Content-Type", cachedResponse.mimeType);
      // Send the cached Base64 image as the response
      return res.send(cachedResponse.data);
    }

    const image = await Image.findById({ _id: id });

    res.set("Content-Type", image.mimeType);
    // Send the Base64 image as the response
    res.send(image.data);

    // Store the image in the cache
    cache.put(`image_${id}`, image, 60000); // Cache for 60 seconds (60000 milliseconds)
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
};

const rating = async (req, res) => {
  try {
    const placeId = req.params.id;
    const { userId, rating: newRating } = req.body;

    // Find the place by ID
    const place = await Place.findById(placeId);

    if (!place) {
      return res.status(404).json({ success: false, error: "Place not found" });
    }

    if (userId) {
      // Find the existing rating for the user
      const existingRatingIndex = place.rating.findIndex(
        (entry) => entry.userId.toString() === userId
      );

      if (existingRatingIndex !== -1) {
        // Update the user's existing rating with the new value
        place.rating[existingRatingIndex].userRating = newRating;
      } else {
        // Add a new rating entry for the user
        place.rating.push({ userId, userRating: newRating });
      }
    } else {
      // If userId is not provided, just update the rating with the given rating
      place.rating.push({ userRating: newRating });
    }

    // Calculate the new total rating by averaging all the ratings
    const totalRating =
      place.rating.reduce((sum, entry) => sum + entry.userRating, 0) /
      place.rating.length;
    place.totalRating = totalRating;

    // Save the updated place
    await place.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: "Place rated successfully.",
    });
  } catch (error) {
    console.error("Error rating place:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error: error });
  }
};
const deletePlaceById = (id) => Place.findByIdAndDelete({ _id: id });

const deletePlace = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    if (!id) {
      res
        .status(400)
        .json({ success: false, message: "place id is required." });
    }

    const place = await deletePlaceById(id);
    if (!place) {
      res
        .status(400)
        .json({ success: false, message: "Error in deleting the place." });
    }

    // res
    //   .status(200)
    //   .json({ success: true, message: "Place delted successfully." });
    req.flash("success", "Places deleted successfully.");
    res.redirect("/places");
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error: error });
  }
};
module.exports = {
  getAllPlaces,
  createPlace,
  rating,
  getImageById,
  getPlaceById,
  nepaliData,
  deletePlace,
};
