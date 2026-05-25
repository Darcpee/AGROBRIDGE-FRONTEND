// Profile dropDown
// document.addEventListener("DOMContentLoaded",()=>{

// const btn=document.getElementById("profileBtn");
// const menu=document.getElementById("profileMenu");

// btn.onclick=(e)=>{
// e.stopPropagation();
// menu.classList.toggle("opacity-0");
// menu.classList.toggle("scale-95");
// menu.classList.toggle("invisible");
// };

// document.onclick=(e)=>{
// if(!btn.contains(e.target)&&!menu.contains(e.target)){
// menu.classList.add("opacity-0","scale-95","invisible");
// }
// };

// });

console.log("marketplace script loaded");


// javascript for //menu toggle

const toggleBtn = document.getElementById("menu-toggle");
const closeBtn = document.getElementById("close-menu");
const menu = document.getElementById("mobile-menu");

// open menu
toggleBtn.addEventListener("click", (e) => {
e.stopPropagation();
menu.classList.toggle("hidden");
});

// close button
closeBtn.addEventListener("click", () => {
menu.classList.add("hidden");
});

// outside click
document.addEventListener("click", (e) => {
if (!menu.contains(e.target) && !toggleBtn.contains(e.target)) {
menu.classList.add("hidden");
}
});




/* ---------------- CLICK ADD TO CART ---------------- */


window.addEventListener("DOMContentLoaded", () => {
    if (token) {
    loadCartCount();
}
});

async function addToCart(productId) {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:4500/addToCart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                productId,
                quantity: 1
            })
        });

        const data = await res.json();
        console.log("ADD CART RESPONSE:", data);

        if (!res.ok) {
            console.error(data.message);
            return;
        }

        loadCartCount();

    } catch (err) {
        console.error("Add to cart error:", err);
    }
}

async function loadCartCount() {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:4500/getCart", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();
        console.log("CART LOAD:", data);

        const items = data.items ||  [];

        const count = items.reduce((total, item) => total + item.quantity, 0);

        updateCartCount(count);

    } catch (err) {
        console.error("Load cart error:", err);
        updateCartCount(0);
    }
}

function updateCartCount(count) {
    const cartCount = document.getElementById("cart-count");

    if (cartCount) {
        cartCount.textContent = count;
    }
}




















// 1 Check if user is logged in
// Get token from localStorage and redirect if not logged in
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

// ==========================
// DOM ELEMENTS
// ==========================
let productGrid;
let searchInput;
let paginationContainer;
let suggestBox;


// ==========================
// STATE
// ==========================
let allProducts = [];
let currentPage = 1;
let totalPages = 1;
let debounceTimer;
let selectedCategory = "";

const maxPageButtons = 5;

// ==========================
// GENERATE STAR RATING
// ==========================
function generateStars(rating) {

    let starsHTML = "";

    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;

    // full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += `<i class="fa-solid fa-star text-yellow-400"></i>`;
    }

    // empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += `<i class="fa-regular fa-star text-yellow-400"></i>`;
    }

    return starsHTML;
}


// ==========================
// INIT
// ==========================
window.addEventListener("DOMContentLoaded", () => {

    productGrid = document.getElementById("productGrid");
    searchInput = document.getElementById("searchInput");
    paginationContainer = document.getElementById("pagination");
    suggestBox = document.getElementById("suggestBox");
   
    setupCategoryFilters();

    fetchProducts();

    // SEARCH + SUGGESTIONS
    searchInput.addEventListener("input", async () => {

        const query = searchInput.value.trim();

        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {

            currentPage = 1;
            fetchProducts(1);

            if (!query) {
                suggestBox.innerHTML = "";
                return;
            }

            fetchSuggestions(query);

        }, 400);

    });

    // close suggestion box when clicking outside
    document.addEventListener("click", (e) => {
        if (!suggestBox.contains(e.target) && e.target !== searchInput) {
            suggestBox.innerHTML = "";
        }
    });

});

// ==========================
// CATEGORY FILTER BUTTONS
// ==========================
function setupCategoryFilters() {

    const filterButtons =
        document.querySelectorAll("#categoryFilters .filter-btn");

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            // remove active style
            filterButtons.forEach(btn => {
                btn.classList.remove("bg-green-500", "text-white");
                btn.classList.add("bg-white");
            });

            // add active style
            button.classList.remove("bg-white");
            button.classList.add("bg-green-500", "text-white");

            // set category
            selectedCategory = button.dataset.category || "";

            console.log("Selected category:", selectedCategory);

            currentPage = 1;

            fetchProducts(1);

        });

    });

}


// ==========================
// SEARCH BUTTON
// ==========================
function searchProduct() {
    currentPage = 1;
    fetchProducts(1);
}


// ==========================
// FETCH SUGGESTIONS
// ==========================
async function fetchSuggestions(query) {

    try {

        const res = await fetch(
            `http://localhost:4500/searchSuggestions?q=${query}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        suggestBox.innerHTML = "";

        if (!data.suggestions || data.suggestions.length === 0) return;

        data.suggestions.forEach(name => {

            const item = document.createElement("div");

            item.textContent = name;
            item.className = "p-2 hover:bg-gray-200 cursor-pointer";

            item.onclick = () => {
                searchInput.value = name;
                suggestBox.innerHTML = "";
                searchProduct();
            };

            suggestBox.appendChild(item);

        });

    } catch (err) {
        console.error("Suggestion error:", err);
    }
}


// ==========================
// FETCH PRODUCTS (SEARCH + PAGINATION)
// ==========================
async function fetchProducts(page = 1) {

    const search = searchInput?.value || "";
    const category = selectedCategory || "";

    console.log("SEARCH:", search);
    console.log("CATEGORY:", category);

    try {

        const res = await fetch(
            `http://localhost:4500/getAllProducts?page=${page}&search=${search}&category=${selectedCategory}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        allProducts = data.products || [];
        currentPage = data.currentPage || 1;
        totalPages = data.totalPages || 1;

        displayProducts();
        renderPagination(totalPages);

    } catch (err) {
        console.error("Fetch error:", err);
    }
}


// ==========================
// DISPLAY PRODUCTS
// ==========================
async function addToCart(productId) {

    try {

        const res = await fetch("http://localhost:4500/addToCart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });

        const data = await res.json();

        console.log("ADD CART RESPONSE:", data);

        if (!res.ok) {
            console.error(data.message);
            return;
        }

        loadCartCount();

    } catch (err) {
        console.error("Add to cart error:", err);
    }

}
function displayProducts() {
console.log("Displaying products...");
    productGrid.innerHTML = "";

    if (allProducts.length === 0) {
        productGrid.innerHTML = `
            <p class="col-span-full text-center text-gray-500">
                No products found
            </p>
        `;
        return;
    }

    allProducts.forEach(product => {

        const rating = product.rating || 0;
        const stars = generateStars(rating);

        const card = document.createElement("div");

        card.className =
            "bg-white rounded-2xl shadow-sm hover:shadow-md transition flex flex-col h-full";

        card.innerHTML = `
            <img src="${product.image}" class="h-40 w-full object-cover rounded-t-2xl">

            <div class="p-2 overflow-hidden flex flex-col flex-grow">

                <div class="flex justify-between font-semibold">
                    <h3>${product.name}</h3>
                    <span class="text-green-600">₦${product.price}/kg</span>
                </div>

                <div class="flex justify-between text-sm mt-2 items-center">

                    <span class="flex items-center gap-1 text-gray-600">
                        <i class="fa-solid fa-user"></i>
                        <span class="whitespace-nowrap overflow-hidden text-ellipsis">${product.farmer?.name || "Unknown"}</span>
                    </span>

                    <span class="flex items-center gap-1 text-yellow-500 whitespace-nowrap flex-shrink-0">
                        ${stars}
                        <span class="text-gray-600 text-sm">${rating}</span>
                    </span>

                </div>

                <button class="mt-7 w-full bg-green-500 text-white py-2.5 rounded-xl text-sm hover:bg-green-600 transition add-to-cart"
                data-id="${product._id}">
                    Add to Cart
                </button>

            </div>
        `;

          // CLICK PRODUCT CARD → OPEN DETAILS PAGE
          const image = card.querySelector("img");
        image.addEventListener("click", () => {
            window.location.href = `productdetail.html?id=${product._id}`;
        });
        // STOP CLICK FROM TRIGGERING CARD NAVIGATION
       const cartBtn = card.querySelector(".add-to-cart");

cartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    addToCart(product._id);
});

        productGrid.appendChild(card);

    });

}

// ==========================
// PAGINATION
// ==========================
function renderPagination(totalPages) {

    paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    const prevBtn = document.createElement("button");

    prevBtn.textContent = "Previous";
    prevBtn.disabled = currentPage === 1;

    prevBtn.className = `px-3 py-1 rounded ${
        prevBtn.disabled ? "bg-gray-300" : "bg-gray-200"
    }`;

    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            fetchProducts(currentPage);
        }
    };

    paginationContainer.appendChild(prevBtn);

    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    for (let i = startPage; i <= endPage; i++) {

        const btn = document.createElement("button");

        btn.textContent = i;

        btn.className = `px-3 py-1 rounded ${
            i === currentPage ? "bg-green-500 text-white" : "bg-gray-200"
        }`;

        btn.onclick = () => {
            currentPage = i;
            fetchProducts(i);
        };

        paginationContainer.appendChild(btn);
    }

    const nextBtn = document.createElement("button");

    nextBtn.textContent = "Next";
    nextBtn.disabled = currentPage === totalPages;

    nextBtn.className = `px-3 py-1 rounded ${
        nextBtn.disabled ? "bg-gray-300" : "bg-gray-200"
    }`;

    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchProducts(currentPage);
        }
    };

    paginationContainer.appendChild(nextBtn);
}






// ==========================
// Logout functionality
// ==========================
// document.addEventListener("DOMContentLoaded", () => {

// const logoutBtn = document.getElementById("logout-btn");
// const logoutModal = document.getElementById("logout-modal");
// const confirmLogout = document.getElementById("confirm-logout");
// const cancelLogout = document.getElementById("cancel-logout");


// // OPEN MODAL
// logoutBtn.addEventListener("click", (e) => {
// e.preventDefault();
// logoutModal.classList.remove("hidden");
// });


// // CANCEL LOGOUT
// cancelLogout.addEventListener("click", () => {
// logoutModal.classList.add("hidden");
// });


// // CONFIRM LOGOUT
// confirmLogout.addEventListener("click", async () => {

// try {

// const token = localStorage.getItem("token");

// const res = await fetch("http://localhost:4500/logout", {
// method: "POST",
// headers: {
// Authorization: `Bearer ${token}`
// }
// });

// const data = await res.json();
// console.log(data);

// // remove token
// localStorage.removeItem("token");
// localStorage.removeItem("user");

// // close modal
// logoutModal.classList.add("hidden");

// // redirect
// window.location.href = "login.html";

// } catch (error) {

// console.error("Logout failed:", error);

// }

// });

// });






// document.addEventListener("DOMContentLoaded", () => {

//   const logoutBtn = document.getElementById("logout-btn");
//   const logoutModal = document.getElementById("logout-modal");
//   const confirmLogout = document.getElementById("confirm-logout");
//   const cancelLogout = document.getElementById("cancel-logout");

//   // OPEN MODAL
//   if (logoutBtn && logoutModal) {
//     logoutBtn.addEventListener("click", (e) => {
//       e.preventDefault();
//       logoutModal.classList.remove("hidden");
//     });
//   }

//   // CANCEL LOGOUT
//   if (cancelLogout && logoutModal) {
//     cancelLogout.addEventListener("click", () => {
//       logoutModal.classList.add("hidden");
//     });
//   }

//   // CONFIRM LOGOUT
//   if (confirmLogout && logoutModal) {
//     confirmLogout.addEventListener("click", async () => {

//       try {

//         // 1. GET TOKEN
//         const token = localStorage.getItem("token");

//         // 2. CALL BACKEND
//         const res = await fetch("http://localhost:4500/logout", {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });

//         const data = await res.json();
//         console.log("Logout response:", data);

//         // 3. CLEAR STORAGE
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");

//         // 4. CLOSE MODAL
//         logoutModal.classList.add("hidden");

//         // 5. REDIRECT
//         window.location.href = "login.html";

//       } catch (error) {
//         console.error("Logout failed:", error);
//       }

//     });
//   }

// });
