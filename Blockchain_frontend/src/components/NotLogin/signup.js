import React, { useContext, useState } from "react";
import HomeNavbar from "./homeNavbar";
import { Link, useNavigate } from "react-router-dom";
import "./form.css";
import { Context } from "../..";
import toast from "react-hot-toast";
import axios from "axios";

const Signup = () => {
  const [userId, setUserID] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const [usertype, setUsertype] = useState();

  const { loading, setLoading } = useContext(Context);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "http://localhost:3002/invoke",
        new URLSearchParams([
          ["", ""],
          ["channelid", "mychannel"],
          ["chaincodeid", "basictest"],
          ["function", "CreateUser"],
          ["args", userId],
          ["args", password],
          ["args", bankName],
          ["args", bankAccountNumber],
          ["args", usertype],
        ])
      );

      const resolvedCurrency =
        bankName === "PNB" || bankName === "SBI" ? "INR" : "USD";

      await axios.post(
        "http://localhost:3002/invoke",
        new URLSearchParams([
          ["", ""],
          ["channelid", "mychannel"],
          ["chaincodeid", "paytest"],
          ["function", "CreateAccount"],
          ["args", bankName],
          ["args", resolvedCurrency],
          ["args", bankAccountNumber],
        ])
      );

      toast.success("Account created! Please sign in.");
      setLoading(false);
      navigate("/login");
    } catch (error) {
      toast.error("Signup failed. User already exists");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <HomeNavbar />

      <main className="auth-main">
        <div className="auth-container">
          <div className="auth-panel-side">
            <div className="auth-side-content">
              <span className="auth-side-badge">Get Started</span>
              <h2 className="auth-side-title">Join the BorderPay network</h2>
              <p className="auth-side-text">
                Create your account to send and receive cross-border payments
                secured by Hyperledger Fabric blockchain technology.
              </p>
            </div>
          </div>

          <div className="auth-panel">
            <h1 className="auth-heading">Create Account</h1>
            <p className="auth-subheading">Fill in your details to get started</p>

            <form className="auth-form" onSubmit={submitHandler}>
              <div className="form-group">
                <label htmlFor="userId">User ID</label>
                <input
                  id="userId"
                  className="form-input"
                  type="text"
                  name="id"
                  value={userId}
                  onChange={(e) => setUserID(e.target.value)}
                  placeholder="Choose a user ID"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bankName">Bank</label>
                <select
                  id="bankName"
                  className="form-select"
                  name="bname"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                >
                  <option value="">Select your bank</option>
                  <option value="PNB">Punjab National Bank</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="BNY">Bank of New York</option>
                  <option value="Barclays">Barclays</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="bankAccountNumber">Bank Account Number</label>
                <input
                  id="bankAccountNumber"
                  className="form-input"
                  type="text"
                  name="bacno"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  className="form-input"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="form-group">
                <label>I am a</label>
                <div className="role-selector">
                  <div className="role-option">
                    <input
                      type="radio"
                      id="signup-employer"
                      name="usertype"
                      value="1"
                      checked={usertype === "1"}
                      onChange={(e) => setUsertype(e.target.value)}
                      required
                    />
                    <label htmlFor="signup-employer">Employer</label>
                  </div>
                  <div className="role-option">
                    <input
                      type="radio"
                      id="signup-employee"
                      name="usertype"
                      value="0"
                      checked={usertype === "0"}
                      onChange={(e) => setUsertype(e.target.value)}
                      required
                    />
                    <label htmlFor="signup-employee">Employee</label>
                  </div>
                </div>
              </div>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="auth-footer-text">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
