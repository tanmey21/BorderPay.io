import React from "react";
import { NavLink } from "react-router-dom";
import "./employerDashboard.css";

const AdminNavbar = () => {
  return (
    <nav className="employer-navbar">
      <div className="employer-navbar-inner">
        <NavLink className="employer-navbar-brand" to="/">
          BorderPay
        </NavLink>
        <div className="employer-navbar-actions">
          <NavLink className="employer-nav-link" to="/">
            Log out
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
