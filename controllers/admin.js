const { comparePassword } = require("../config/securePassword");
const { User } = require("../models/users");

const loadLoginView = (req, res) => {
  try {
    res.status(200).render("login");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    try {
      const email = req.body.email;
      const password = req.body.password;

      const adminData = await User.findOne({ email: email });

      // compare password with hash userData.password
      if (adminData) {
        const isMatched = await comparePassword(password, adminData.password);
        if (isMatched) {
          if (adminData.isVerify) {
            req.session.adminId = adminData._id;
            res.redirect("/admin/home");
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
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const loadHomeView = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.session.adminId });
    res.status(200).render("home", { admin: admin });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.status(200).redirect("/admin/login");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const loadDashboardView = async (req, res) => {
  try {
    //Search bar input
    let search = req.query.search ? req.query.search : "";

    //pagination on Dashnoard
    const { page = 1, limit = 2 } = req.query;

    const usersCount = await User.find({
      isAdmin: 0,

      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    }).countDocuments();
    console.log(usersCount);
    const users = await User.find({
      isAdmin: 0,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    })
      .limit(limit)
      .skip((page - 1) * limit);

    console.log(users);

    res.status(200).render("dashboard", {
      users: users,
      totalPages: Math.ceil(usersCount / limit),
      currentPage: page,
      nextPage: page + 1,
      prevPage: page - 1,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    // we can also find a user if it exist or not. additional line.

    const userData = await User.findByIdAndDelete({ _id: req.query.id });

    if (userData) {
      res.redirect("/admin/dashboard");
    } else {
      res.send("user was not deleted");
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const loadEditView = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findOne({ _id: id });
    console.log(userData);
    if (userData) {
      res.render("edit", { user: userData });
    } else {
      res.status(404).send({
        message: `user does not exist with this Id`,
      });
    }
    res.render("edit");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          isVerify: req.body.verify,
        },
      }
    );
    if (userData) {
      res.redirect("/admin/dashboard");
    } else {
      res.status(404).send({
        message: `user does not exist with this Id`,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const loadAdminRegister = async (req, res) => {
  try {
    res.status(200).render("registration");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const registerAdminUser = async (req, res) => {
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

      res.status(201).redirect("/admin/registration", {
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
const loadAdminResetPassword = async (req, res) => {
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

const resetAdminPassword = async (req, res) => {
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
    res.redirect("/admin/login");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};
module.exports = {
  loadLoginView,
  loginAdmin,
  loadHomeView,
  adminLogout,
  loadDashboardView,
  deleteUser,
  loadEditView,
  updateUser,
  loadAdminRegister,
  registerAdminUser,
  loadAdminResetPassword,
  resetAdminPassword,
};
