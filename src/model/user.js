const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: {
    type: String,
    enum: ["buyer", "farmer"],
    default: "buyer"
  }
},{timestamps: true} );
module.exports = mongoose.model("User", UserSchema);