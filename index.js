const express = require("express");
const app = express();
const mongoose = require("mongoose");
const router = require("./src/router/router");
const webhookrouter = require("./src/router/webhookrouter");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
dotenv.config();
const DB = process.env.DB


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/",router);
app.use("/webhookrouter",webhookrouter)

app.listen(4500, async()=>{
    console.log("server is running on http://localhost:4500")
    try {
        await mongoose.connect(process.env.DB);
        console.log("connected to DB")
    } catch (error) {
          console.log("database not connected", error);
    }
})