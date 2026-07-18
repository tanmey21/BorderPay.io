import React from "react";
import { Link } from "react-router-dom";
import "./homeNavbar.css";

const HomeNavbar = () => {
  return (
    <header className="home-navbar">
      <div className="home-navbar-inner">
        <Link to="/" className="home-navbar-brand">
          BorderPay
        </Link>
        <a
          href="https://hyperledger-fabric.readthedocs.io/en/latest/"
          target="_blank"
          rel="noopener noreferrer"
          className="home-navbar-docs"
        >
          Hyperledger Fabric Docs
        </a>
      </div>
    </header>
  );
};

export default HomeNavbar;
