const axios = require ("axios");
const Order = require ("../model/order");



exports.initializePayment = async (req,res)=>{

try{

      const { orderId }= req.params.orderId

      const order = await Order.findById(orderId)

      if(!order){
  return res.status(404).json({message:"Order not found"})
   }

      const response = await axios.post(
"https://api.paystack.co/transaction/initialize",

  {
  email:req.user.email,
  amount:order.total * 100, // Paystack uses kobo
  callback_url:"http://localhost:3000/payment-success",
  metadata:{
  orderId:order._id
  }
},

 {
  headers:{
  Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
" Content-Type":"application/json"
    }
  }
) 

res.json(response.data)

}catch(err){

res.status(500).json({error:err.message})

}

};



exports.verifyPayment = async (req, res) => {

  try {

    const reference = req.params.reference;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const paymentData = response.data.data;

    console.log("PAYSTACK RESPONSE:", paymentData);

    if (paymentData.status === "success") {

      const orderId = paymentData.metadata.orderId;

      console.log("ORDER ID:", orderId);

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: "paid",
          status: "processing"
        },
        { new: true }
      );

      console.log("UPDATED ORDER:", updatedOrder);

    }

    res.json(paymentData);

  } catch (err) {
    console.log("VERIFY ERROR:", err);
    res.status(500).json({ error: err.message });
  }

};