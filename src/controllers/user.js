const { sanitizeEmail, sanitizeName } = require("../middlewares/Sanitizer");
const generateToken = require("../middlewares/generateToken");
const hasGen = require("../middlewares/hashGen");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const sendEmail = require("../middlewares/sendEmail");

const createUser = async (req, res) => {
  if (
    !req.body.email ||
    !req.body.name ||
    !req.body.password ||
    !req.body.confirmPassword
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Fields are required." });
  }
  try {
    const { name, email, password, confirmPassword } = req.body;
    const sanitizedName = await sanitizeName(name);

    const sanitizedEmail = await sanitizeEmail(email);

    const existingUser = await User.findOne({ email: sanitizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with the same email.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match.",
      });
    }

    const hashPass = await hasGen(password);

    const createdUser = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashPass,
    });
    if (!createdUser.id) {
      return res.status(400).json({
        success: false,
        message: "Error: User cannot be created",
      });
    }

    const data = {
      id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
    };
    console.log(data);
    return res.status(200).json({
      success: true,
      message: "User created successfully.",
      user: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
const userLogin = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ success: false, message: "Fields are required." });
  }
  const { email, password } = req.body;
  const sanitizedEmail = await sanitizeEmail(email);

  try {
    const existingUser = await User.findOne({ email: sanitizedEmail });

    if (!existingUser) {
      return res
        .status(403)
        .json({ success: false, message: "No user found with this email" });
    }
    const isPasswordValid = bcrypt.compare(password, existingUser.password);

    if (!isPasswordValid) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid credentials" });
    }
    if (!existingUser.token) {
      const token = generateToken(existingUser);
      existingUser.token = token;
      existingUser.save();
    }
    res.cookie("AUTH-TOKEN", existingUser.token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: existingUser.token,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e,
    });
  }
};
const dashboardLogin = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.redirect("/admin?error=blankFields");
  }
  const { email, password } = req.body;
  const sanitizedEmail = await sanitizeEmail(email);

  try {
    const existingUser = await User.findOne({ email: sanitizedEmail });

    if (!existingUser.isAdmin) {
      return res.status(403).redirect("/admin?error=credentialsError");
    }

    if (!existingUser) {
      return res.redirect("/admin?error=credentialsError");
    }
    const isPasswordValid = bcrypt.compare(password, existingUser.password);

    if (!isPasswordValid) {
      return res.redirect("/admin?error=credentialsError");
    }
    if (!existingUser.token) {
      const token = generateToken(existingUser);
      existingUser.token = token;
      existingUser.save();
    }
    res.cookie("AUTH-TOKEN", existingUser.token);
    return res.redirect("/dashboard");
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e,
    });
  }
};

const deleteUserById = async (req, res) => {
  const user = req.user;

  try {
    // Find the user by userId and delete
    const deletedUser = await User.findByIdAndDelete({ _id: user.id });

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // User deleted successfully
    res.status(200).json({
      sucess: true,
      message: `User with ID ${user.id} has been deleted`,
    });
  } catch (error) {
    // Handle any errors that occur during deletion
    res
      .status(500)
      .json({ error: "An error occurred while deleting the user" });
  }
};

const getUserById = async (req, res) => {
  const user = req.user;
  try {
    const userData = await User.findById({ _id: user.id });
    let phone = userData.phone ? userData.phone : "";

    const filterData = {
      id: userData._id,
      name: userData.name,
      email: userData.email,
      phone,
      createdAt: userData.createdAt,
    };
    return res.status(200).json({ sucess: true, user: filterData });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  if (!req.body.email) {
    return res
      .status(400)
      .json({ sucess: false, message: "Email field is required" });
  }
  const { email } = req.body;

  let result;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ sucess: false, message: "User not found" });
    }

    const resp = await user.generatePasswordResetToken();
    if (resp) {
      const token = user.token;
      sendEmail(user.name, user.email, token)
        .then((res) => {
          result = res.sucess;
        })
        .catch((err) => console.log(err));
    }

    if (result === false)
      return res
        .status(400)
        .json({ sucess: false, message: "Error in Email sending" });

    return res
      .status(200)
      .json({ sucess: true, message: "Password reset token sent" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ sucess: false, message: "Internal Server Error" });
  }
};

const verfyOTP = async (req, res) => {
  const { email, token } = req.body;
  if (!req.body.token) {
    return res
      .status(400)
      .json({ sucess: false, message: "Token field cannot be left blank." });
  }
  try {
    const user = await User.findOne({ email });
    // Check if the user exists
    if (!user) {
      return res.status(404).json({ sucess: false, message: "User not found" });
    }
    // Check if the token is valid and not expired
    if (user.token !== token || user.resetPasswordExpires < Date.now()) {
      return res
        .status(400)
        .json({ sucess: false, message: "Invalid or expired token" });
    }

    return res.status(200).json({
      sucess: true,
      message: "Token verified.",
      key: generateToken(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      sucess: false,
      message: "An error occurred during otp verify.",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const user = req.user;

  try {
    // Find the user by email
    const existingUser = await User.findOne({ email: user.email });

    // Check if the user exists
    if (!existingUser) {
      return res.status(404).json({ sucess: false, message: "User not found" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        sucess: false,
        message: "Password and Confirm password didn't match",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      bcrypt.genSaltSync(10)
    );

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          token: undefined,
          resetPasswordExpires: undefined,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "Error in password update.",
      });
    }

    const result = await updatedUser.save();
    if (!result) {
      return res.status(500).json({
        success: false,
        message: "Error in password update.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      sucess: false,
      message: "An error occurred during password update.",
      error: error.message,
    });
  }
};
module.exports = {
  createUser,
  userLogin,
  deleteUserById,
  getUserById,
  forgotPassword,
  verfyOTP,
  resetPassword,
  dashboardLogin,
};
