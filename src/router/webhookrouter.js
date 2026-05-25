const express = require("express");
const { paystackWebhook } = require("../webhooks/paystackwebhook");
const router = express.Router();





router.post("/paystackWebhook", express.raw({type:"application/json"}),paystackWebhook );


module.exports = router;