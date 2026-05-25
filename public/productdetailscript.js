const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

window.addEventListener("DOMContentLoaded", loadProduct);

async function loadProduct() {

    try {

        const res = await fetch(`http://localhost:4500/getProduct/${productId}`);

        const data = await res.json();

        // adjust depending on backend structure
        const product = data.product || data;

        const image = document.getElementById("productImage");
        const name = document.getElementById("productName");
        const price = document.getElementById("productPrice");
        const farmer = document.getElementById("productFarmer");
        const description = document.getElementById("productDescription");

        if (image) image.src = product.image;
        if (name) name.textContent = product.name;
        if (price) price.textContent = `₦${product.price}/kg`;
        if (farmer) farmer.textContent = `Farmer: ${product.farmer?.name || "Unknown"}`;
        if (description) description.textContent = product.description || "No description available.";

        console.log("Product image element:", image);

    } catch (error) {

        console.error("Error loading product:", error);

    }
}
loadProduct();