const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "email is required"],
    trim: true,
    minlength: [3, "password must have atleast 3 characters"],
    maxlength: [100, "password must have atleast 100 characters"],
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
    unique: true,
    minlength: [3, "password must have atleast 3 characters"],
  },
  image: {
    type: String,
    required: [true, "image is required"],
  },
  isAdmin: {
    type: Number,
    required: [true, "isAdmin is requierd"], // user --> 0 is not admin, 1 is an admin
  },
  isVerify: {
    type: Number,
    default: 0, // user 0 is not verified by default -> send email -> click on email -> 1, user verified
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  token: {
    type: String,
    default: "",
  },
});

exports.User = model("Users", userSchema);
