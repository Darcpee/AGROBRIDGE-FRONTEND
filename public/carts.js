// update cart count on market page
function updateCartCount(count){

const cartCount = document.getElementById("cart-count");

if(cartCount){
cartCount.textContent = count || "0";
}

}

// Displays Cart Products
async function loadCart(){

const token = localStorage.getItem("token");

const res = await fetch("http://localhost:4500/getCart",{
headers:{
Authorization:`Bearer ${token}`
}
});

const data = await res.json();

const container = document.getElementById("cart-items");

container.innerHTML = "";

data.items.forEach(item=>{

const totalPrice = item.product.price * item.quantity;

container.innerHTML += `

<div class="flex gap-6 items-center bg-white border border-white rounded-lg p-6 mb-4 shadow-sm">

  <!-- Product Image -->
  <img src="${item.product.image}" 
       class="w-24 sm:w-32 h-32 object-cover rounded-lg transition-transform duration-500" />

  <!-- Product Info -->
  <div class="flex-1">

    <h3 class="font-bold text-lg">${item.product.name}</h3>

    <p class="text-sm text-gray-500 mt-1">
      ${item.product.description || "No description available"}
    </p>

    <p class="font-semibold text-green-700 mt-2">
      $${item.product.price}
    </p>

    <!-- Quantity Controls -->
    <div class="flex items-center gap-3 mt-3">

      <button onclick="decreaseQty('${item.product._id}')"
        class="w-8 h-8 bg-gray-200 rounded flex items-center justify-center font-bold">
        -
      </button>

      <span class="font-bold">${item.quantity}</span>

      <button onclick="increaseQty('${item.product._id}')"
        class="w-8 h-8 bg-green-600 text-white rounded flex items-center justify-center font-bold">
        +
      </button>

    </div>

  </div>

  <!-- Total Price + Delete -->
  <div class="flex items-center gap-6">

    <!-- Item Total -->
    <p class="font-bold text-lg text-green-700">
      $${totalPrice}
    </p>

    <!-- Delete Button -->
    <button onclick="removeItem('${item.product._id}')"
      class="text-red-500 hover:text-red-700 text-xl">
      <i class="fa-solid fa-trash"></i>
    </button>

  </div>

</div>

`;

});

}

loadCart();


// loadCardCount
async function loadCartCount(){

const token = localStorage.getItem("token");

const res = await fetch("http://localhost:4500/getCart",{
headers:{
Authorization:`Bearer ${token}`
}
});

const data = await res.json();

if(!data.items){
updateCartCount(0);
return;
}

const count = data.items.reduce((total,item)=>{
return total + item.quantity;
},0);

updateCartCount(count);

}




// delete item from cart
async function removeItem(productId){

await fetch(`http://localhost:4500/removeItem/${productId}`, {
method: "DELETE",
headers: {
Authorization: `Bearer ${localStorage.getItem("token")}`
}
});

loadCart();
loadCartCount();

}


window.addEventListener("DOMContentLoaded", () => {

loadCart();
loadCartCount();

});


// increase quantity
async function increaseQty(productId){

await fetch(`http://localhost:4500/increaseQty/${productId}`, {
method: "PUT",
headers: {
Authorization: `Bearer ${localStorage.getItem("token")}`
}
});

loadCart();
loadCartCount();

}


// decrease quantity
async function decreaseQty(productId){

await fetch(`http://localhost:4500/decreaseQty/${productId}`, {
method: "PUT",
headers: {
Authorization: `Bearer ${localStorage.getItem("token")}`
}
});

loadCart();
loadCartCount();

}


// update notification count on cart page from backend
// async function loadNotifications(){

// const res = await fetch("http://localhost:4500/notifications");
// const data = await res.json();

// document.getElementById("update-notification").textContent = data.length;

// }

// window.addEventListener("DOMContentLoaded", loadNotifications);
 


// update notification count 
function updateNotificationCount(count){
    const notification = document.getElementById("update-notification");
    notification.textContent = count;
}

// Hide Badge When Zero
function updateNotificationCount(count){

const badge = document.getElementById("update-notification");

if(count === 0){
badge.style.display = "none";
}else{
badge.style.display = "flex";
badge.textContent = count;
}

}


// listen for notification updates via websocket
// const socket = new WebSocket("ws://localhost:4500");

// socket.addEventListener("message", event => {

//   const data = json.parse(event.data);

//   if(data.type === "notiotificationUpdate"){
//     updateNotificationCount(data.count);
//   }
// })



// calculate total price of cart items
async function updateCartTotal(){

try{

const token = localStorage.getItem("token")

const res = await fetch("http://localhost:4500/getcart",{
headers:{
Authorization:`Bearer ${token}`
}
})

if(!res.ok){
console.error("Failed to load cart")
return
}

const data = await res.json()
console.log(data)
/* ---------- CHECK IF CART IS EMPTY ---------- */
if(data.items.length === 0){
document.getElementById("checkout-btn").disabled = true
}
const subtotal = Number(data.subtotal)
const shipping = Number(data.shipping)
const tax = Number(data.tax)
const total = Number(data.total)


document.getElementById("subtotal").textContent = "$" + subtotal.toFixed(2)
document.getElementById("Estimated-shipping").textContent = "$" + shipping.toFixed(2)
document.getElementById("tax").textContent = "$" + tax.toFixed(2)
document.getElementById("grand-total").textContent = "$" + total.toFixed(2)

}catch(error){
console.error("Cart error:", error)
}

}

window.addEventListener("DOMContentLoaded", updateCartTotal)


// proceed to checkout
document.getElementById("checkout-btn").addEventListener("click", ()=>{

window.location.href = "payments.html"

})