const express = require("express");
const { registerUser, login, logout } = require("../AUTH/User");
const { authenticateToken } = require("../middleware/authmiddleware");
const { upload } = require("../config/cloudinary");
const { searchProduct, getAllProducts, searchSuggestions } = require("../AUTH/product");
const { getCart } = require("../AUTH/cart");
const { verifyPayment } = require("../AUTH/payment");
const router = express.Router();

router.post("/registerUser", registerUser);
router.post("/login", login);
router.post("/logout", require("../AUTH/User").logout);
router.get("/authenticateToken", require("../middleware/authmiddleware").authenticateToken);
router.get("/getUserprofile", authenticateToken, require("../AUTH/User").getUserprofile);
router.post("/uploadProduct", upload.single("image"), authenticateToken, require("../AUTH/product").uploadProduct);
router.get("/getAllProducts", getAllProducts);
router.get("/searchProduct", authenticateToken, require("../AUTH/product"). searchProduct);
router.get("/searchSuggestions", searchSuggestions);
router.get("/getProduct/:id", require("../AUTH/product").getProductById);
router.post("/addToCart", authenticateToken, require("../AUTH/cart").addToCart);
router.get("/getCart", authenticateToken, require("../AUTH/cart").getCart);
router.delete("/removeItem/:productId", authenticateToken, require("../AUTH/cart").removeItem)
router.put("/decreaseQty/:productId", authenticateToken, require("../AUTH/cart").decreaseQty);
router.put("/increaseQty/:productId", authenticateToken, require("../AUTH/cart").increaseQty);
router.post("/createOrder", authenticateToken, require("../AUTH/order").createOrder);
router.get("/verifyPayment/:reference", verifyPayment);
router.post("/initializePayment", authenticateToken,require("../AUTH/payment").initializePayment)

module.exports =router;