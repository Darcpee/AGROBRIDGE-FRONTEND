// Toggle passwod visisbility
const toggle = document.getElementById("togglePass");
const password = document.getElementById("password");

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

// Toggle between buyer and farmer selection
const buyer = document.getElementById("buyerBtn");
const farmer = document.getElementById("farmerBtn");

buyer.onclick = () =>{
buyer.classList.add("bg-white","border-2","border-green-500","shadow-sm");
farmer.classList.remove("bg-white","border-2","border-orange-400","shadow-sm");
}

farmer.onclick = () =>{
farmer.classList.add("bg-white","border-2","border-green-500","shadow-sm");
buyer.classList.remove("bg-white","border-2","border-orange-400","shadow-sm");
}



//Handle signup form submission
document.addEventListener("DOMContentLoaded", () => {

const signupForm = document.getElementById("signupForm");
const loading = document.getElementById("loadingOverlay");

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    loading.style.display = "flex";
    console.log("Form submitted");

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value;

    const role = buyer.classList.contains("bg-white") ? "buyer" : "farmer";

    try {

        const response = await fetch("https://agrobridge-frontend.onrender.com/registerUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password, phone, role })
        });

        const data = await response.json();

        loading.style.display = "none";

        if (response.ok) {

            console.log("Registration successful");

            alert("Registration successful. Please login.");

            window.location.href = "login.html";

        } else {

            alert(data.message || "Registration failed");

        }

    } catch (error) {

        loading.style.display = "none";
        console.error("Error:", error);

    }
});

});