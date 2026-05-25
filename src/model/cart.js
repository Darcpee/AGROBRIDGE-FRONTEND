const mongoose = require("mongoose");
const CartItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
 product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
});

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [CartItemSchema],

    totalPrice: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

module.exports = mongoose.model("Cart", CartSchema);
