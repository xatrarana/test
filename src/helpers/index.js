const User = require("../model/user");
const { merge } = require("lodash");
//actions
const getUserByToken = async (email) => {
  return await User.findOne({ email });
};
const isAuthenticated = async (req, res, next) => {
  try {
    const { email } = req.body;
    const sessionToken = req.cookies["AUTH-TOKEN"];
    if (!sessionToken) {
      return res.redirect("/admin"); // Redirect to login page or appropriate route
    }

    const existingUser = await User.findOne({ token: sessionToken });
    console.log(existingUser);
    if (!existingUser) {
      return res.redirect("/admin"); // Redirect to login page or appropriate route
    }

    // Merge the existing user data with the request object
    Object.assign(req, { identity: existingUser });

    next(); // Continue with the next middleware or route handler
  } catch (error) {
    console.log(error);
    return res.sendStatus(400); // Internal Server Error
  }
};
const isLoggedIn = async (req, res, next) => {
  try {
    const sessionToken = req.cookies["AUTH-TOKEN"];
    if (sessionToken) {
      return res.redirect("/dashboard");
    }

    next();
  } catch (error) {
    console.log(error);
    next();
  }
};

module.exports = { isAuthenticated, isLoggedIn };

// export const isOwner = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const { id } = req.params;
//     const currentUserId = get(req, "identity._id") as string;
//     if (!currentUserId) {
//       return res.sendStatus(403);
//     }
//     if (currentUserId.toString() !== id) {
//       return res.sendStatus(403);
//     }
//     next();
//   } catch (error) {
//     console.log(error);
//     return res.sendStatus(400);
//   }
// };
