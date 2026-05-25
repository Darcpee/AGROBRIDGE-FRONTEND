const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
   name: String,
   price: Number,
   description: String,
   image: String,
   category: String,
   rating: { type: Number, default: 0 },
   farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   }
});

module.exports = mongoose.model("Product", ProductSchema);