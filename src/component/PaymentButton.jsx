import React, { useState } from 'react';

const PaymentButton = ({ 
  amount = 500,  // Amount in rupees
  currency = 'INR',
  customerDetails = {
    name: 'Customer Name',
    email: 'customer@example.com',
    phone: '9999999999'
  }
}) => {
  const [loading, setLoading] = useState(false);

  // 🔴 IMPORTANT: Replace these with your actual Razorpay Test Keys
  // Get from: https://dashboard.razorpay.com/app/keys
  const RAZORPAY_KEY_ID = 'rzp_test_R7xzyaqsmw9C9O';  // REPLACE THIS
  const RAZORPAY_KEY_SECRET = 'DLdef075HFBf6IYxe2nK5T0r';     // REPLACE THIS

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Step 1: Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Step 2: Create order on backend
      // Change this URL to your actual backend URL
      const API_URL = 'http://localhost:5000/api';
      
      const orderResponse = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: currency,
          razorpayKeyId: RAZORPAY_KEY_ID,
          razorpayKeySecret: RAZORPAY_KEY_SECRET,
          customerDetails: customerDetails,
          notes: {
            product: 'Your Product Name',
            timestamp: new Date().toISOString()
          }
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error('Failed to create order');
      }

      // Step 3: Configure Razorpay Checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'Your Store Name',
        description: 'Payment for your purchase',
        order_id: orderData.data.orderId,
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone
        },
        theme: {
          color: '#3399cc'
        },
        // This automatically shows ALL payment modes:
        // UPI, Credit/Debit Cards, Netbanking, Wallets, EMI, etc.
        
        handler: async function(response) {
          // Step 4: Verify payment
          const verifyResponse = await fetch(`${API_URL}/payment/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              razorpayKeySecret: RAZORPAY_KEY_SECRET
            })
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            alert(`✅ Payment Successful!\nPayment ID: ${verifyData.paymentId}`);
            // Optional: Redirect to success page
            window.location.href = '/payment-success';
          } else {
            throw new Error(verifyData.message);
          }
        },
        
        modal: {
          ondismiss: function() {
            console.log('Checkout closed');
            alert('Payment cancelled');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on('payment.failed', function(response) {
        console.error('Payment Failed:', response.error);
        alert(`Payment Failed: ${response.error.description}`);
      });
      
      razorpayInstance.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      style={{
        backgroundColor: '#3399cc',
        color: 'white',
        padding: '12px 30px',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1
      }}
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
};

export default PaymentButton;