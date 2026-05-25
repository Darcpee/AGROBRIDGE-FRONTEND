const Order = require("../model/order");
const Cart = require("../model/cart");
const axios = require("axios");

// place an order
exports.createOrder = async (req, res) => {
  try {
    const { paymentMethod, shippingAddress } = req.body;
    const userId = req.user._id;

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate subtotal
    let subtotal = 0;

    cart.items.forEach(item => {
      subtotal += Number(item.product.price) * item.quantity;
    });

    // Fees
    const shipping = 12;
    const tax = subtotal * 0.08;
    const totalPrice = subtotal + shipping + tax;

    // Create order
    const order = await Order.create({
      user: userId,

      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),

      subtotal,
      shipping,
      tax,
      totalPrice,

      shippingAddress: shippingAddress || null,
      paymentMethod: paymentMethod || "paystack",

      status: "Pending",
      paymentStatus: "pending"
    });

    // If payment method is CARD → initialize Paystack
    if (paymentMethod === "paystack") {

      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: req.user.email,
          amount: totalPrice * 100, // Paystack uses kobo
          reference: order._id.toString(),
          callback_url: "http://localhost:4500/verifyPayment.html",
          metadata: {
    orderId: order._id
  }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      // clear cart AFTER payment initialization
      cart.items = [];
      await cart.save();

      return res.status(200).json({
        message: "Order created. Redirect user to payment.",
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
        order
      });
    }

    // If payment is NOT card (e.g Pay on Delivery)
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    console.error("Order creation error:", error);

    res.status(500).json({
      message: "Error creating order",
      error: error.message,
    });
  }
};

// Get orders for user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.product");
    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};