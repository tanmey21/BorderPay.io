import React, { useContext, useState } from "react";
import "./form.css";
import { Link, Navigate } from "react-router-dom";
import HomeNavbar from "./homeNavbar";
import { Context } from "../..";
import axios from "axios";
import toast from "react-hot-toast";

const Login = () => {
  const [userid, setuserid] = useState("");
  const [password, setPassword] = useState("");
  const [usertype, setUsertype] = useState();
  const [isLogined, setIsLogined] = useState(false);
  const { setUserId } = useContext(Context);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:3002/invoke",
        new URLSearchParams([
          ["", ""],
          ["channelid", "mychannel"],
          ["chaincodeid", "basictest"],
          ["function", "LoginFunc"],
          ["args", userid],
          ["args", password],
          ["args", usertype],
        ])
      );
      window.localStorage.setItem("userId", userid);
      setUserId(userid);
      setIsLogined(true);
      toast.success("Login successful");
    } catch (error) {
      toast.error("Bad Credentials");
      setIsLogined(false);
    }
  };

  if (isLogined) {
    if (usertype === "1") {
      return <Navigate to={"/employer/home"} />;
    }
    return <Navigate to={"/employee/home"} />;
  }

  return (
    <div className="auth-page">
      <HomeNavbar />

      <main className="auth-main">
        <div className="auth-container">
          <div className="auth-panel-side">
            <div className="auth-side-content">
              <span className="auth-side-badge">Secure Access</span>
              <h2 className="auth-side-title">Welcome back to BorderPay</h2>
              <p className="auth-side-text">
                Sign in to manage cross-border payments, view contracts, and
                track your blockchain-secured transactions.
              </p>
            </div>
          </div>

          <div className="auth-panel">
            <h1 className="auth-heading">Sign In</h1>
            <p className="auth-subheading">Enter your credentials to continue</p>

            <form className="auth-form" onSubmit={submitHandler}>
              <div className="form-group">
                <label htmlFor="userid">User ID</label>
                <input
                  id="userid"
                  className="form-input"
                  type="text"
                  name="id"
                  value={userid}
                  onChange={(e) => setuserid(e.target.value)}
                  placeholder="Enter your user ID"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  className="form-input"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="form-group">
                <label>I am a</label>
                <div className="role-selector">
                  <div className="role-option">
                    <input
                      type="radio"
                      id="employer"
                      name="usertype"
                      value="1"
                      checked={usertype === "1"}
                      onChange={(e) => setUsertype(e.target.value)}
                      required
                    />
                    <label htmlFor="employer">Employer</label>
                  </div>
                  <div className="role-option">
                    <input
                      type="radio"
                      id="employee"
                      name="usertype"
                      value="0"
                      checked={usertype === "0"}
                      onChange={(e) => setUsertype(e.target.value)}
                      required
                    />
                    <label htmlFor="employee">Employee</label>
                  </div>
                </div>
              </div>

              <button className="auth-submit" type="submit">
                Sign In
              </button>
            </form>

            <p className="auth-footer-text">
              New user? <Link to="/signup">Create an account</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
