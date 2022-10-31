const isLoggedIn = async (req, res, next) => {
  try {
    if (req.session.adminId) {
    } else {
      return res.redirect("/admin/login");
    }

    next();
  } catch (error) {
    console.log(error);
  }
};

const isLoggedOut = async (req, res, next) => {
  try {
    if (req.session.adminId) {
      return res.redirect("/admin/home");
    }
    next();
  } catch (error) {
    console.log(error);
  }
};
module.exports = { isLoggedIn, isLoggedOut };
