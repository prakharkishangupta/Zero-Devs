const Mongoose = require("mongoose");
const nanoid = require("nanoid").nanoid;
const Schema = Mongoose.Schema;

const User = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(6),
      immutable: true,
    },
    oauth: {
      type: Boolean,
      default: false,
    },
    refreshToken: String,
  },
  {
    timestamps: true,
  }
);

module.exports = Mongoose.model("User", User);
