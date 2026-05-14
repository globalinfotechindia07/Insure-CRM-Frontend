import React, { useState } from "react";
import { createCustomer } from "../../services/customerApi";
import { useNavigate } from "react-router-dom";

const CustomerForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clientType: "",
    customerName: "",
    dob: "",
    email: "",
    mobile: "",
    pan: "",
    aadhar: "", // ✅ fixed
    drivingLicence: "",
    gst: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Basic Validation
    if (!formData.customerName || !formData.mobile) {
      alert("Name and Mobile are required");
      return;
    }

    try {
      setLoading(true);

      await createCustomer(formData);

      alert("Customer Saved ✅");

      navigate("/customer"); // ✅ fixed route
    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h2>Customer Registration</h2>

      <form onSubmit={handleSubmit}>

        <select name="clientType" value={formData.clientType} onChange={handleChange} required>
          <option value="">Select Client Type</option>
          <option value="corporate">Corporate</option>
          <option value="retail">Retail</option>
        </select>

        <input
          name="customerName"
          placeholder="Name"
          value={formData.customerName}
          onChange={handleChange}
          required
        />

        <input type="date" name="dob" value={formData.dob} onChange={handleChange} />

        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />

        <input name="mobile" placeholder="Mobile" value={formData.mobile} onChange={handleChange} />

        <input name="pan" placeholder="PAN" value={formData.pan} onChange={handleChange} />

        <input name="aadhar" placeholder="Aadhar" value={formData.aadhar} onChange={handleChange} />

        <input
          name="drivingLicence"
          placeholder="Driving Licence"
          value={formData.drivingLicence}
          onChange={handleChange}
        />

        <input name="gst" placeholder="GST" value={formData.gst} onChange={handleChange} />

        <textarea
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
        />

        <input name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} />

        <input name="city" placeholder="City" value={formData.city} onChange={handleChange} />

        <input name="state" placeholder="State" value={formData.state} onChange={handleChange} />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Submit"}
        </button>

      </form>
    </div>
  );
};

export default CustomerForm;