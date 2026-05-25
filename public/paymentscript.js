document.addEventListener("DOMContentLoaded", () => {

let selectedPayment = "paystack";
let selectedAddress = "";


/* ---------- LOAD CHECKOUT SUMMARY ---------- */

async function loadCheckoutSummary(){

const token = localStorage.getItem("token")

const res = await fetch("http://localhost:4500/getcart",{
headers:{
Authorization:`Bearer ${token}`
}
})

const data = await res.json()
console.log(data)

/* ---------- CHECK IF CART IS EMPTY ---------- */

if(data.items.length === 0){
document.getElementById("checkout-btn").disabled = true
}

/* ---------- TOTALS ---------- */

const subtotal = Number(data.subtotal)
const shipping = Number(data.shipping)
const tax = Number(data.tax)
const total = Number(data.total)

document.getElementById("subtotal").textContent = "$" + subtotal.toFixed(2)
document.getElementById("shipping").textContent = "$" + shipping.toFixed(2)
document.getElementById("tax").textContent = "$" + tax.toFixed(2)
document.getElementById("grand-total").textContent = "$" + total.toFixed(2)

/* ---------- SHOW CHECKOUT ITEMS ---------- */

const container = document.getElementById("checkout-items")

container.innerHTML = ""

data.items.forEach(item => {

const productTotal = item.product.price * item.quantity

container.innerHTML += `
<div class="flex items-center gap-4">
<img src="${item.product.image}" class="w-12 h-12 rounded object-cover">

<div class="flex-1">
<p class="font-semibold">${item.product.name}</p>
<p class="text-sm text-gray-500">${item.quantity} × $${item.product.price}</p>
</div>

<div class="font-semibold">$${productTotal}</div>
</div>
`
})

}


/* ---------- PAYMENT METHOD SELECTION ---------- */

document.querySelectorAll(".payment-method").forEach(btn => {

btn.addEventListener("click", () => {

document.querySelectorAll(".payment-method").forEach(b=>{
b.classList.remove("border-green-500")
b.classList.add("border-gray-300")
})

btn.classList.remove("border-gray-300")
btn.classList.add("border-green-500")

selectedPayment = btn.dataset.method

})

})


/* ---------- CREATE ORDER ---------- */

document.getElementById("checkout-btn").addEventListener("click", async ()=>{

const token = localStorage.getItem("token")
const selectedAddress = document.getElementById("shipping-address").value;
if (!selectedAddress) {
  alert("Shipping address is required");
  return;
}

const res = await fetch("http://localhost:4500/createOrder",{

method:"POST",

headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},

body:JSON.stringify({
paymentMethod:selectedPayment,
shippingAddress: selectedAddress
})

})

const data = await res.json()

console.log("Server response:",data)

if(data.authorization_url){
window.location.href = data.authorization_url;
}else{
alert("Payment initialization failed");
}

})


/* ---------- LOAD PAGE ---------- */

loadCheckoutSummary()

})