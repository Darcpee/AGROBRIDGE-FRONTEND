// Toggle password visisbility
const toggle = document.getElementById("togglePass");
const password = document.getElementById("loginpassword");

const icon = toggle.querySelector("i");

toggle.addEventListener("click", function () {

if (password.type === "password") {
password.type = "text";
icon.classList.remove("fa-eye-slash");
icon.classList.add("fa-eye");
} else {
password.type = "password";
icon.classList.remove("fa-eye");
icon.classList.add("fa-eye-slash");
}

});


// Handle login form sumittion
const loginForm = document.getElementById("loginForm");
const loadingOverlay = document.getElementById("loadingOverlay");

if (loginForm) {

loginForm.addEventListener("submit", async (e) => {
e.preventDefault();

loadingOverlay.style.display = "flex";

const email = document.getElementById("loginemail").value;
const password = document.getElementById("loginpassword").value;

try {

const res = await fetch("http://localhost:4500/login", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({ email, password })
});

const data = await res.json();
console.log("Response from server:", data);

if (res.ok && data.token) {

localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));

alert(`Welcome back, ${data.user?.email || "user"}!`);

// SAFE ROLE CHECK
if (data.user?.role === "farmer") {
window.location.href = "farmersdashboard.html";
} else {
window.location.href = "marketplace.html";
}

} else {
alert(data.message || "Login failed");
}

} catch (err) {
console.error("Error logging in:", err);
alert("Login failed: " + err.message);
}

finally {
loadingOverlay.style.display = "none";
}

});

} else {
console.error("Login form not found! Check your form ID.");
}
