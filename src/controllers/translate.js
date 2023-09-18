require("dotenv").config();
const TextTranslationClient =
  require("@azure-rest/ai-translation-text").default;
const Place = require("../model/place");

const apiKey = process.env.apiKeyT;
const endpoint = process.env.endpointT;
const region = process.env.regionT;
async function getTranslatedData(text) {

  let result;
  const translateCredential = {
    key: apiKey,
    region,
  };
  const translationClient = new TextTranslationClient(
    endpoint,
    translateCredential
  );
  const inputText = [{ text: text }];
  const translateResponse = await translationClient.path("/translate").post({
    body: inputText,
    queryParameters: {
      to: "ne",
      from: "en",
    },
  });
  const translations = translateResponse.body;
  for (const translation of translations) {
    result = translation?.translations[0]?.text;
  }

  return result;
}
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

async function Translate(req, res) {
  let shuffledPlaces = [];
  let translatedPlaces = [];

  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (page && limit) {
      const skip = (page - 1) * limit;
      const places = await Place.find().skip(skip).limit(limit);
      shuffledPlaces = shuffleArray(places);
    } else {
      const places = await Place.aggregate([{ $sample: { size: 9999999 } }]);
      shuffledPlaces = shuffleArray(places);
    }
  } catch (e) {
    console.error("Error retrieving places:", e);
    res.status(500).json({ success: false, error: e });
  }

  // load data before sending the response
  await Promise.all(
    shuffledPlaces.map(async (place) => {
      const translatedTitle = await getTranslatedData(place.title);
      const translatedDesc = await getTranslatedData(place.description);
      const translatedLocation = await getTranslatedData(place.location);
      const translatedCategory = await getTranslatedData(place.category);
      translatedPlaces.push({
        __v: place.__v,
        _id: place._id,
        title: translatedTitle,
        slug_name: place.slug_name,
        description: translatedDesc,
        location: translatedLocation,
        wardno: place.wardno,
        category: place.category,
        TransDataCategory: translatedCategory,
        images: place.images,
        coordinates: place.coordinates,
        totalRating: place.totalRating,
        rating: place.rating,
      });
    })
  );
  res.setHeader("Cache-Control", "public, max-age=60");
  res.json({ success: true, places: translatedPlaces });
}

module.exports = { Translate };
