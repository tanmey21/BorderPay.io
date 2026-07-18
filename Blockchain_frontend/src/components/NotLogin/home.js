import React from "react";
import { Link } from "react-router-dom";
import HomeNavbar from "./homeNavbar.js";
import "./home.css";
import { FaShieldAlt, FaGlobeAmericas, FaFileContract } from "react-icons/fa";

const features = [
  {
    icon: <FaShieldAlt />,
    title: "Blockchain Security",
    description:
      "Every transaction is recorded on Hyperledger Fabric, ensuring tamper-proof and transparent payment records.",
  },
  {
    icon: <FaGlobeAmericas />,
    title: "Cross-Border Payments",
    description:
      "Send and receive payments across borders with reduced friction, lower costs, and faster settlement.",
  },
  {
    icon: <FaFileContract />,
    title: "Smart Contracts",
    description:
      "Automated employment contracts and payroll rules enforced on-chain — no middlemen required.",
  },
];

const steps = [
  { number: "01", title: "Create Account", text: "Sign up as an employer or employee with secure credentials." },
  { number: "02", title: "Set Up Contract", text: "Define payment terms, schedules, and conditions on the ledger." },
  { number: "03", title: "Pay & Track", text: "Execute cross-border payments and monitor balances in real time." },
];

const team = [
  { name: "Havi Bohra", id: "210429" },
  { name: "Satyam Gupta", id: "210942" },
  { name: "Tanmey Agarwal", id: "211098" },
];

const Home = () => {
  window.localStorage.removeItem("userId");

  return (
    <div className="home-page">
      <HomeNavbar />

      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">Powered by Hyperledger Fabric</span>
          <h1 className="hero-title">
            Cross-border payments,
            <span className="hero-highlight"> simplified.</span>
          </h1>
          <p className="hero-subtitle">
            BorderPay connects employers and employees through secure blockchain
            payments — transparent, fast, and built for a global workforce.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary-custom">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-outline-custom">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <img src="/images/home.jpg" alt="BorderPay platform preview" />
            <div className="hero-stat-card">
              <span className="stat-value">100%</span>
              <span className="stat-label">On-chain transparency</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-header">
          <h2>Why BorderPay?</h2>
          <p>A modern payment platform designed for trust, speed, and global reach.</p>
        </div>
        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="steps-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to start paying across borders.</p>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <div className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="roles-section">
        <div className="section-header">
          <h2>Built for Everyone</h2>
          <p>Whether you hire or get hired — BorderPay has you covered.</p>
        </div>
        <div className="roles-grid">
          <div className="role-card">
            <img src="/images/employer.jpg" alt="Employer dashboard" />
            <div className="role-card-body">
              <h3>For Employers</h3>
              <p>Create contracts, manage payroll, and send cross-border payments to your global team.</p>
              <Link to="/signup" className="role-link">Register as Employer →</Link>
            </div>
          </div>
          <div className="role-card">
            <img src="/images/employee.jpg" alt="Employee dashboard" />
            <div className="role-card-body">
              <h3>For Employees</h3>
              <p>View contracts, track incoming payments, and manage your balance — all in one place.</p>
              <Link to="/signup" className="role-link">Register as Employee →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to transform your payments?</h2>
        <p>Join BorderPay and experience blockchain-powered payroll today.</p>
        <Link to="/signup" className="btn btn-primary-custom btn-lg-custom">
          Create Free Account
        </Link>
      </section>

      <footer className="home-footer">
        <p className="footer-label">CS731 End Term Project</p>
        <div className="team-list">
          {team.map((member) => (
            <span className="team-member" key={member.id}>
              {member.name} <em>({member.id})</em>
            </span>
          ))}
        </div>
        <p className="footer-copy">© 2024 BorderPay · IIT Delhi</p>
      </footer>
    </div>
  );
};

export default Home;
