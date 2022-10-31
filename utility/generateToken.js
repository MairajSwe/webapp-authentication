const randomstring = require("randomstring");

exports.getRandomString = () => {
  return randomstring.generate();
};
