import React, { useEffect, useState } from "react";
import { getCustomers, deleteCustomer } from "../../services/customerApi";

const CustomerList = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const res = await getCustomers();
    setData(res.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    await deleteCustomer(id);
    fetchData();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Customer List</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Mobile</th>
            <th>City</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item._id}>
              <td>{item.customerName}</td>
              <td>{item.clientType}</td>
              <td>{item.mobile}</td>
              <td>{item.city}</td>
              <td>
                <button onClick={() => handleDelete(item._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerList;