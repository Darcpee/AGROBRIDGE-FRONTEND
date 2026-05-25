const express = require("express");
const Cart = require("../model/cart");
const Product = require("../model/product");


// Helper function to calculate total price
const calculateTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Add product to cart
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({ message: "productId and quantity are required" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const quantityNum = Number(quantity);
        const priceNum = Number(product.price);

        if (isNaN(quantityNum) || quantityNum <= 0) {
            return res.status(400).json({ message: "Quantity must be a positive number" });
        }
        if (isNaN(priceNum)) {
            return res.status(400).json({ message: "Product price is invalid" });
        }

        const cartItem = {
            product: product._id,
            quantity: quantityNum,
            price: priceNum,
            description: product.description,
            farmer: product.farmer
        };

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [cartItem],
                totalPrice: priceNum * quantityNum
            });
        } else {
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantityNum;
            } else {
                cart.items.push(cartItem);
            }

            cart.totalPrice = cart.items.reduce((total, item) => {
                const itemPrice = Number(item.price) || 0;
                const itemQuantity = Number(item.quantity) || 0;
                return total + itemPrice * itemQuantity;
            }, 0);
        }

        await cart.save();
        return res.status(200).json({
    items: cart.items,
    totalPrice: cart.totalPrice
});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

       if (!cart) {
  return res.json({ items: [], subtotal:0, shipping:0, tax:0, total:0 });
}
let subtotal = 0;

cart.items.forEach(item => {
    const itemPrice = Number(item.price) || 0;
    const itemQuantity = Number(item.quantity) || 0;
    subtotal += Number(item.product.price) * item.quantity;
});

const shipping = 12
const tax = subtotal * 0.08
const total = subtotal + shipping + tax

        res.status(200).json({ ...cart._doc, subtotal, shipping, tax, total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Delete item from cart
exports.removeItem = async (req, res) => {

  const cart = await Cart.findOne({ user: req.user.id });

  cart.items = cart.items.filter(
    i => i.product.toString() !== req.params.productId
  );

  await cart.save();

  res.json(cart);
};

// decrease quantity
exports.decreaseQty = async (req, res) => {

  const cart = await Cart.findOne({ user: req.user.id });

  const item = cart.items.find(i =>
    i.product.toString() === req.params.productId
  );

  if (item && item.quantity > 1) {
    item.quantity -= 1;
  }

  await cart.save();

  res.json(cart);
};

// increase quantity
exports.increaseQty = async (req, res) => {

  const cart = await Cart.findOne({ user: req.user.id });

  const item = cart.items.find(i =>
    i.product.toString() === req.params.productId
  );

  if (item) {
    item.quantity += 1;
  }

  await cart.save();

  res.json(cart);
};