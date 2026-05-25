const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}

// CONFIRM ROLE IS FARMER
if (!user || user.role !== "farmer") {
  alert("Access denied. Only farmers can access this page.");
  window.location.href = "marketplace.html";
}


const form = document.getElementById("product-Form");
const productList = document.getElementById("product-List");


// ============================
// UPLOAD PRODUCT
// ============================

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("product-Name").value;
  const price = document.getElementById("product-Price").value;
  const description = document.getElementById("product-Description").value;
  const image = document.getElementById("product-Image").files[0];

  const formData = new FormData();

  formData.append("name", name);
  formData.append("price", price);
  formData.append("description", description);
  formData.append("image", image);

  try {

    const res = await fetch("http://localhost:4500/uploadProduct", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();

    alert("Product uploaded successfully");

    form.reset();

    loadProducts();

  } catch (error) {
    console.log(error);
  }

});


// ============================
// LOAD FARMER PRODUCTS
// ============================

async function loadProducts() {

  try {

    const res = await fetch("http://localhost:4500/api/products/farmer", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const products = await res.json();

    productList.innerHTML = "";

    products.forEach(product => {

      productList.innerHTML += `
      
      <div class="border rounded-lg p-4">

        <img src="http://localhost:4500/${product.image}" 
        class="h-40 w-full object-cover rounded" />

        <h3 class="font-semibold mt-2">
        ${product.name}
        </h3>

        <p class="text-gray-500">
        ₦${product.price}
        </p>

      </div>

      `;

    });

  } catch (error) {
    console.log(error);
  }

}


loadProducts();