import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const CreateContract = ({ onContractCreated }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [payment, setPayment] = useState("");
  const [duration, setDuration] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const logeduserid = window.localStorage.getItem("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(
        "http://localhost:3002/invoke",
        new URLSearchParams([
          ["", ""],
          ["channelid", "mychannel"],
          ["chaincodeid", "basictest"],
          ["function", "CreateContract"],
          ["args", logeduserid],
          ["args", employeeId],
          ["args", payment],
          ["args", duration],
        ])
      );

      toast.success("Contract created successfully");
      setEmployeeId("");
      setPayment("");
      setDuration("");
      if (onContractCreated) onContractCreated();
    } catch (error) {
      toast.error("Contract creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div>
          <h2 className="dashboard-card-title">Create Contract</h2>
          <p className="dashboard-card-subtitle">
            Set up a new payment agreement with an employee
          </p>
        </div>
      </div>

      <form className="contract-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="employeeId">Employee ID</label>
          <input
            id="employeeId"
            className="form-input"
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Enter employee user ID"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="payment">Payment Amount</label>
          <input
            id="payment"
            className="form-input"
            type="number"
            min="1"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            placeholder="Salary in your currency"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="duration">Duration (months)</label>
          <input
            id="duration"
            className="form-input"
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Contract length in months"
            required
          />
        </div>

        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Contract"}
        </button>
      </form>
    </div>
  );
};

export default CreateContract;
