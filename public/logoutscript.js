// logout
document.getElementById("confirmLogout").addEventListener("click", async () => {

try {

const token = localStorage.getItem("token");

await fetch("https://agrobridge-frontend.onrender.com/logout", {
method: "POST",
headers: {
"Authorization": `Bearer ${token}`
}
});

// remove token from browser
localStorage.removeItem("token");
localStorage.removeItem("user");

// redirect to login
window.location.href = "login.html";

} catch (error) {

console.error("Logout failed:", error);

}

});


document.getElementById("cancelLogout").addEventListener("click", () => {

// go back to previous page
window.history.back();

});
