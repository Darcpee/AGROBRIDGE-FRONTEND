const { cloudinary } = require("../config/cloudinary");
const product = require("../model/product");
const Product = require("../model/product");


//upload new product
exports.uploadProduct = async (req, res) => {
    try {
       const user = req.user;
       //check if user is a farmer
       if (user.role !== "farmer") {
            return res.status(403).json({ message: "Only farmers can upload products" });
        }
        const { name, price, description,category, rating, image } = req.body;
         //upload image to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "AgroBridge-frontend",
        });
        const product = new Product({
            name,
            price,
            description,
            category,
            rating,
            image:result.secure_url, // save cloudinary image
            farmer: user._id
        });
        console.log(product);
        await product.save();
        res.status(201).json({ message: "Product uploaded successfully", product });
    } catch (error) {
        console.log("UPLOAD ERROR:", error);
        res.status(500).json({ message: "Error uploading product", error:error.message });
    }
}

// Get all products with pagination and search and category filter
exports.getAllProducts = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        const search = req.query.search || "";
        const category = req.query.category || "";

        // ==============================
        // BUILD FILTER DYNAMICALLY
        // ==============================
        let filter = {};

        // 🔍 SEARCH FILTER
        if (search.trim()) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        //  CATEGORY FILTER
        if (category && category.trim()) {
            filter.category = { $regex: category, $options: "i" };
        }

        // ==============================
        // TOTAL COUNT (after filters)
        // ==============================
        const total = await Product.countDocuments(filter);

        // ==============================
        // FETCH PRODUCTS
        // ==============================
        const products = await Product.find(filter)
            .populate("farmer", "name")
            .skip((page - 1) * limit)
            .limit(limit);

        // ==============================
        // RESPONSE
        // ==============================
        return res.status(200).json({
            message: "Products fetched successfully",
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            products
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get products uploaded by the logged-in farmer
exports.getFarmerProducts = async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== "farmer") {
            return res.status(403).json({ message: "Only farmers have products" });
        }

        const products = await Product.find({ farmer: user._id });
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update a product (Only the farmer who owns it)
exports.updateProduct = async (req, res) => {
    try {
        const user = req.user;
        const { productId } = req.params;
        const { name, price, description, image } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        if (product.farmer.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You can only update your own products" });
        }

        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.image = image || product.image;

        await product.save();
        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete a product (Only the farmer who owns it)
exports.deleteProduct = async (req, res) => {
    try {
        const user = req.user;
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        if (product.farmer.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You can only delete your own products" });
        }

        await product.remove();
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

//Search for product
exports.searchProduct = async (req, res) => {
    try {

        const searchQuery = req.query.q;

        if (!searchQuery) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const products = await Product.find({
            $or: [
                { name: { $regex: searchQuery, $options: "i" } },
                { description: { $regex: searchQuery, $options: "i" } },
                { category: { $regex: searchQuery, $options: "i" } }
            ]
        }).populate("farmer", "name");

        return res.status(200).json({
            message: "Products fetched",
            products
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

//search suggestion box
exports.searchSuggestions = async (req, res) => {
    try {
        const query = req.query.q || "";
        const limit = 10;

        const page = Math.max(1, parseInt(req.query.page) || 1);

        if (!query.trim()) {
            return res.json({
                suggestions: [],
                currentPage: 1,
                totalPages: 0
            });
        }

        const searchFilter = {
            $or: [
                { name: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } }
            ]
        };

        const total = await Product.countDocuments(searchFilter);
        const totalPages = Math.ceil(total / limit);

        const safePage = Math.min(page, totalPages || 1);
        const skip = (safePage - 1) * limit;

        const products = await Product.find(searchFilter)
            .skip(skip)
            .limit(limit)
            .select("name");

        return res.json({
            suggestions: products.map(p => p.name),
            currentPage: safePage,
            totalPages
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate("farmer", "name");
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product fetched", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}