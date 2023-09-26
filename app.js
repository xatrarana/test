require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const os = require("os");
const port = process.env.PORT || 6700;
const connectDB = require("./config/db");
const authRouter = require("./src/routes/auth");
const userRouter = require("./src/routes/user");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const hostname = os.hostname();
const path = require("path");
const imageRouter = require("./src/routes/image");
const placeRouter = require("./src/routes/place");
const rateLimit = require("./src/middlewares/security/rateLimit");
const ipBlock = require("./src/middlewares/security/ipBlock");
const sendRouter = require("./src/routes/phone");
const checkApiKey = require("./src/middlewares/apiKeyVerify");
const multer = require("multer");
const upload = require("./src/middlewares/FileUpload");
const cookieParser = require("cookie-parser");
const flash = require("express-flash");
//Create a new instance of MongoDBStore with your MongoDB connection options:
const TransportRouter = require("./src/routes/transport");
//serveing staic files
app.use(express.static("public"));
const store = new MongoDBStore({
  uri: process.env.DATABASE_URL,
  // uri: process.env.localDb,
  collection: "sessions",
});

app.use(flash());
app.use(cookieParser());
// Configure session middleware
app.use(
  session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
//monitor log
const {
  monitorLog,
  monitorMiddleware,
} = require("./src/middlewares/MonitorLog");
const { getAllPlaces } = require("./src/controllers/place");
const Place = require("./src/model/place");
const { isAuthenticated, isLoggedIn } = require("./src/helpers");
const User = require("./src/model/user");
const { decodeToken } = require("./src/middlewares/generateToken");
///view
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//middle ware
app.use(express.json()); //json value accepted by the server
app.use(express.urlencoded({ extended: true })); //used for the body vlaue
//app.use(helmet()); //security by adding the necessary headers
app.use(cors()); //for local host testing

//monitor middleware
app.use(monitorMiddleware);
//security
//block ip and rateLimit
app.use(rateLimit);
app.use(ipBlock);

// Serve static images from the images directory
app.use("/v1/images", checkApiKey, imageRouter);

//routes
app.use("/v1/user", checkApiKey, userRouter); //handle user routes

//handle auth routes
app.use("/v1/auth", authRouter);
//handle the place routes
app.use("/v1/places", placeRouter);

//handle mobile otp
app.use("/v1/phone", checkApiKey, sendRouter);

//transport route
app.use("/v1/routes", TransportRouter);
// root request
app.get("/", (req, res, next) => {
  try {
    return res.status(200).json({
      sucess: true,
      message: "welcome api service",
    });
  } catch (error) {
    next(error);
  }
});
app.get("/admin", isLoggedIn, (req, res) => {
  res.render("auth", { req: req });
});
app.get("/logout", (req, res) => {
  res.clearCookie("AUTH-TOKEN");
  req.flash("success", "Logout successfully.");
  res.redirect("/admin");
});
app.get("/dashboard", isAuthenticated, async (req, res) => {
  const placeCount = await Place.find().countDocuments();
  const userCount = await User.find().countDocuments();
  const sessionToken = req.cookies["AUTH-TOKEN"];
  const user = decodeToken(sessionToken);
  res.render("dashboard", {
    placeCount: placeCount,
    userCount: userCount,
    hotelCount: 12,
    user: user,
  });
});

app.get("/places", isAuthenticated, async (req, res) => {
  const sessionToken = req.cookies["AUTH-TOKEN"];
  const user = decodeToken(sessionToken);
  const places = await Place.find();
  res.render("place", { data: places, messages: req.flash(), user: user });
});

app.get("/places/view-details", async (req, res) => {
  const sessionToken = req.cookies["AUTH-TOKEN"];
  const user = decodeToken(sessionToken);
  const placeId = req.query.id;
  console.log(placeId);
  const place = await Place.findById(placeId);

  res.render("details", { data: place, user: user });
  // res.json(place).end();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
//monitor log url
app.get("/monitor", checkApiKey, (req, res) => {
  res.render("monitor", { monitorLog });
});

// Serve robots.txt
app.get("/robots.txt", (req, res) => {
  res.sendFile(__dirname + "/robots.txt");
});

//start server
async function startServer() {
  try {
    await connectDB().catch((error) => {
      console.log("Error connecting to database:", error);
      process.exit(1);
    });

    const server = app.listen(port, () => {
      const address = server.address();

      console.log(`server is running at http://${address.address}:${port}`);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      // handle the error here
    });
  } catch (error) {
    console.log("Error in server running.", error);
  }
}
startServer();
