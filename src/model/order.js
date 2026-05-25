const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
      },
    ],
    subtotal:Number,
    shipping:Number,
    tax:Number,
    totalPrice: { type: Number, required: true },
    status: { type: String, default: "Pending", enum: ["Pending", "Confirmed", "Shipped", "Delivered"] },
    shippingAddress: { type: String, required: true },
    paymentMethod: { type: String, required: true, enum: ["paystack","card", "bank ", "mobile"],default:"paystack" },
    paymentStatus: { type: String, default: "pending", enum: ["pending", "paid", "failed"] },
    paymentReference:String,

}, { timestamps: true } );
module.exports = mongoose.model("Order", OrderSchema);
