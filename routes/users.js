const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const session = require("express-session");
const {
  loadRegister,
  registerUser,
  loadLogin,
  loginUser,
  loadHome,
  logOutUser,
  verifyEmail,
  loadResendVerification,
  resendVerificationLink,
  loadForgetPassword,
  forgetPassword,
  loadResetPassword,
  resetPassword,
  deleteUser,
  updateUser,
  loadEditProfile,
  editUserProfile,
} = require("../controllers/users");
const { upload } = require("../middlewares/uploadFile");
const { dev } = require("../config");
const { isLoggedIn, isLoggedOut } = require("../middlewares/auth");

const userRoute = express(); // userRoute work as 'app'

userRoute.use(
  session({
    secret: dev.app.secret_key,
    resave: false,
    saveUninitialized: true,
  })
);

userRoute.use(morgan("dev"));
userRoute.use(express.static("public"));
userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({ extended: true }));

// Register routes
userRoute.get("/register", isLoggedOut, loadRegister);
userRoute.post("/register", upload.single("image"), registerUser);

// Login routes
userRoute.get("/login", isLoggedOut, loadLogin);
userRoute.post("/login", loginUser);

// Home routes
userRoute.get("/home", isLoggedIn, loadHome);

userRoute.get("/logout", isLoggedIn, logOutUser);

// Verification routes
userRoute.get("/verify", isLoggedOut, verifyEmail);
userRoute.get("/resend-verification", isLoggedOut, loadResendVerification);
userRoute.post("/resend-verification", isLoggedOut, resendVerificationLink);

//Reset password

userRoute.get("/forget-password", isLoggedOut, loadForgetPassword);
userRoute.post("/forget-password", isLoggedOut, forgetPassword);
userRoute.get("/reset-password", isLoggedOut, loadResetPassword);
userRoute.post("/reset-password", isLoggedOut, resetPassword);

//Update user
userRoute.get("/edit", isLoggedIn, loadEditProfile);
userRoute.post("/edit", upload.single("image"), editUserProfile);

//Delete User
userRoute.delete("/:id", deleteUser);

module.exports = userRoute;
