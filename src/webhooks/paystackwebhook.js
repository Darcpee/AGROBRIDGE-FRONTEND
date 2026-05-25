const crypto = require("crypto");
const Order = require("../model/order");
const Cart = require("../model/cart");

exports.paystackWebhook = async (req, res) => {

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(400).send("Invalid signature");
  }

  const event = req.body;

  if (event.event === "charge.success") {

    const reference = event.data.reference;

    const order = await Order.findById(reference);

    if (order) {

      // update order
      order.paymentStatus = "paid";
      order.status = "Confirmed";

      await order.save();

      // clear cart
      const cart = await Cart.findOne({ user: order.user });

      if (cart) {
        cart.items = [];
        await cart.save();
      }

      console.log("Payment successful and cart cleared");

    }

  }

  res.sendStatus(200);
};