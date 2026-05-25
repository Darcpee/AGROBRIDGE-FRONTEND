async function verifyPayment() {

  const params = new URLSearchParams(window.location.search);
  const reference = params.get("reference");

  console.log("REFERENCE:", reference);

  const token = localStorage.getItem("token");

  const res = await fetch(
    `http://localhost:4500/verifypayment/${reference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();

  console.log("RESPONSE:", data);

  if (data.status === "success") {

    document.body.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white shadow-lg rounded-xl p-8 text-center max-w-md w-full">

          <div class="flex justify-center mb-4">
            <div class="bg-green-100 p-4 rounded-full">
              <i class="fas fa-check text-green-600 text-3xl"></i>
            </div>
          </div>

          <h2 class="text-2xl font-bold text-green-600 mb-2">
            Payment Successful
          </h2>

          <p class="text-gray-600 mb-6">
            Your payment was successful. Your order is now being processed.
          </p>

          <div class="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 mb-6">
            Reference: ${reference}
          </div>

          <a href="/orders.html"
            class="block w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600">
            View My Orders
          </a>

        </div>
      </div>
    `;

  } else {

    document.body.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white shadow-lg rounded-xl p-8 text-center max-w-md w-full">

          <div class="flex justify-center mb-4">
            <div class="bg-red-100 p-4 rounded-full">
              <i class="fas fa-times text-red-600 text-3xl"></i>
            </div>
          </div>

          <h2 class="text-2xl font-bold text-red-600 mb-2">
            Payment Failed
          </h2>

          <p class="text-gray-600 mb-6">
            Unfortunately your payment could not be completed.
            Please try again.
          </p>

          <a href="/checkout.html"
            class="block w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600">
            Try Payment Again
          </a>

        </div>
      </div>
    `;
  }

}

verifyPayment();