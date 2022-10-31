const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const session = require("express-session");

const { upload } = require("../middlewares/uploadFile");
const { dev } = require("../config");
const { isLoggedIn, isLoggedOut } = require("../middlewares/adminAuth");
const {
  loadLoginView,
  loginAdmin,
  loadHomeView,
  adminLogout,
  loadDashboardView,
  deleteUser,
  loadEditView,
  updateUser,
  loadAdminRegister,
  registerUser,
  registerAdminUser,
  loadAdminResetPassword,
  resetAdminPassword,
} = require("../controllers/admin");

const adminRoute = express(); // adminRoute work as 'app'

adminRoute.use(
  session({
    secret: dev.app.secret_key,
    resave: false,
    saveUninitialized: true,
  })
);

adminRoute.set("views", "./views/admin");
adminRoute.use(morgan("dev"));
adminRoute.use(express.static("public"));
adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true }));

adminRoute.get("/login", isLoggedOut, loadLoginView);
adminRoute.post("/login", loginAdmin);
adminRoute.get("/home", loadHomeView);
adminRoute.get("/logout", isLoggedIn, adminLogout);
adminRoute.get("/dashboard", isLoggedIn, loadDashboardView);

adminRoute.get("/register", isLoggedOut, loadAdminRegister);
adminRoute.post("/register", upload.single("image"), registerAdminUser);

adminRoute.get("/reset-password", isLoggedOut, loadAdminResetPassword);
adminRoute.post("/reset-password", isLoggedOut, resetAdminPassword);

adminRoute.get("/delete-user", isLoggedIn, deleteUser);

adminRoute.get("/edit-user", isLoggedIn, loadEditView);
adminRoute.post("/edit-user", isLoggedIn, updateUser);

module.exports = adminRoute;
