const { userInfo } = require("os");
const { securePassword, comparePassword } = require("../config/securePassword");
const { User } = require("../models/users");
const { getRandomString } = require("../utility/generateToken");
const { sendResetEmail } = require("../utility/sendResetEmail");
const { sendVerificationEmail } = require("../utility/sendVerificationEmail");

// 1- loding registration view
const loadRegister = async (req, res) => {
  try {
    res.status(200).render("registration");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

// 2- Filled in registration view form getting data and save in database
const registerUser = async (req, res) => {
  try {
    const password = req.body.password;
    const hashPassword = await securePassword(password);
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      image: req.file.filename,
      isAdmin: 0,
    });
    const userData = await newUser.save();
    if (userData) {
      // for verification of email adress
      sendVerificationEmail(userData.name, userData.email, userData._id);

      res.status(201).render("registration", {
        message: "Registration successful. Please verify your email.",
      });
    } else {
      res.status(404).send({ message: " 404 not found" });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

// 3- Simple loading login view page
const loadLogin = async (req, res) => {
  try {
    res.status(200).render("login");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

// 4- after getting email & password, checking if matched then logged in & redirect to home page
const loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    // compare password with hash userData.password
    if (userData) {
      const isMatched = await comparePassword(password, userData.password);
      if (isMatched) {
        if (userData.isVerify) {
          req.session.userId = userData._id;
          res.redirect("/home");
        } else {
          res
            .status(404)
            .render("login", { message: `Please verify your email first` });
        }
      } else {
        // Even email is valid but we are giving non authorized user that email and password both wrong.
        res.status(404).send({ message: `Email and password not match` });
      }
    } else {
      res.status(404).send("User does not exist with this email & password");
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

// 5- loading home page, home view with logout link throwing back to login route
const loadHome = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userId });

    res.status(200).render("home", { user: user });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

// 6- login out efter logged in and redirecting to login route.
const logOutUser = async (req, res) => {
  try {
    req.session.destroy();
    res.status(200).redirect("/login");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const id = req.query.id;

    const userUpdated = await User.updateOne(
      { _id: id },
      {
        $set: {
          isVerify: 1,
        },
      }
    );
    if (userUpdated) {
      res.render("verification", { message: "Verification successful" });
    } else {
      res.render("verification", { message: "Verification unsuccessful" });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};
const loadResendVerification = (req, res) => {
  try {
    res.render("resend-verification");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const resendVerificationLink = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });

    if (userData) {
      sendVerificationEmail(userData.name, userData.email, userData._id);
      res.render("resend-verification", {
        message: "Verification link has been send your email",
      });
    } else {
      res.render("resend-verification", {
        message: "Verification unsuccessful",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const loadForgetPassword = (req, res) => {
  try {
    res.render("forget-password");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });

    if (userData) {
      if (userData.isVerify) {
        const randomString = getRandomString();
        await User.updateOne(
          { email: email },
          {
            $set: {
              token: randomString,
            },
          }
        );
        sendResetEmail(
          userData.name,
          userData.email,
          userData.id,
          randomString
        );
        res.render("forget-password", {
          message: "Please check your email for resetting password",
        });
      } else {
        res.render("forget-password", {
          message: "Verifiy your email address.",
        });
      }
    } else {
      res.render("forget-password", {
        message: "This email does not exist.",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const loadResetPassword = async (req, res) => {
  try {
    const token = req.query.token;
    const userData = await User.findOne({ token: token });

    if (userData) {
      res.render("reset-password", { userId: userData._id });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const userId = req.body.userId;

    const hashPassword = await securePassword(password);
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          password: hashPassword,
          token: "",
        },
      }
    );
    res.redirect("/login");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const updateUser = (req, res) => {
  let id = req.params.id;
  let data = req.body;
  let findIndex = users.findIndex((user) => user.id === Number(id));
  if (findIndex !== -1) {
    let currentUser = users[findIndex];
    let updatedUser = { ...currentUser, ...data };
    users[findIndex] = updatedUser;
    res.status(200).json({
      message: "Update user",
      updatedUser,
    });
  } else {
    res.status(400).json({
      message: "User not found in list",
    });
  }
};

const deleteUser = (req, res) => {
  const id = req.params.id;
  const user = User.find((user) => user.id === id);
  if (!user) {
    res.status(404).send({
      message: "No user available with this id",
    });
  } else {
    User = User.filter((user) => user.id !== id);
    res.status(200).send(User);
  }
};

const loadEditProfile = async (req, res) => {
  try {
    const id = req.query.id;
    const user = await User.findById({ _id: id });
    if (user) {
      res.status(200).render("edit", { user: user });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const editUserProfile = async (req, res) => {
  try {
    const id = req.body.user_id;

    if (req.file) {
      const user = await User.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            image: req.file.filename,
          },
        }
      );
    } else {
      const user = await User.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
          },
        }
      );
    }

    res.redirect("/home");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};
module.exports = {
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
};
