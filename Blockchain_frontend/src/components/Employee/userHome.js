import React, { useCallback, useEffect, useState } from "react";
import UserNavbar from "./userNavbar.js";
import axios from "axios";
import toast from "react-hot-toast";
import ShowBalance from "../Employer/showBalance.js";
import { parseQueryResponse } from "../../utils/parseQueryResponse";
import "../Employer/employerDashboard.css";

const getStatusClass = (status) => {
  if (status === "Pending") return "status-pending";
  if (status === "Accepted") return "status-accepted";
  if (status === "Revoked") return "status-revoked";
  return "status-default";
};

const UserHome = () => {
  const logeduserid = window.localStorage.getItem("userId");
  const [createdContracts, setCreatedContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(true);

  const fetchContracts = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3002/query", {
        params: {
          channelid: "mychannel",
          chaincodeid: "basictest",
          function: "FetchAllContractsbyUserID",
          args: logeduserid,
        },
      });

      const jsonData = parseQueryResponse(response.data) ?? [];
      setCreatedContracts(jsonData);
    } catch (error) {
      toast.error("Error fetching contracts");
      console.error("Error fetching contracts:", error);
    } finally {
      setLoadingContracts(false);
    }
  }, [logeduserid]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleRevoke = async (contract_id) => {
    try {
      await axios.post(
        "http://localhost:3002/invoke",
        new URLSearchParams([
          ["", ""],
          ["channelid", "mychannel"],
          ["chaincodeid", "basictest"],
          ["function", "RevokeContract"],
          ["args", contract_id],
        ])
      );
      toast.success("Contract revoked");
      fetchContracts();
    } catch (error) {
      console.error("Error making revoke", error);
      toast.error("Revoke failed");
    }
  };

  const handleAccept = async (contract_id) => {
    try {
      await axios.post(
        "http://localhost:3002/invoke",
        new URLSearchParams([
          ["", ""],
          ["channelid", "mychannel"],
          ["chaincodeid", "basictest"],
          ["function", "AcceptContract"],
          ["args", contract_id],
        ])
      );
      toast.success("Contract accepted");
      fetchContracts();
    } catch (error) {
      toast.error("Accept failed");
      console.error("Error making accept", error);
    }
  };

  return (
    <div className="employer-page">
      <UserNavbar />

      <main className="employer-main">
        <header className="employer-header">
          <div>
            <h1>Employee Dashboard</h1>
            <p>Review employment contracts and track incoming payments.</p>
          </div>
          <div className="employer-user-badge">
            Signed in as <span>{logeduserid}</span>
          </div>
        </header>

        <div className="employer-grid-single">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div>
                <h2 className="dashboard-card-title">Getting Started</h2>
                <p className="dashboard-card-subtitle">
                  How contracts work on BorderPay
                </p>
              </div>
            </div>
            <ul className="info-card-list">
              <li>
                Employers send you contract offers with payment terms and duration.
              </li>
              <li>
                Accept a pending contract to activate it on the blockchain ledger.
              </li>
              <li>
                Once accepted, payments from your employer are recorded securely on-chain.
              </li>
              <li>
                You can revoke a contract at any time before or after acceptance.
              </li>
            </ul>
          </div>

          <ShowBalance logeduserid={logeduserid} />
        </div>

        <section className="contracts-section">
          <div
            className="dashboard-card-header"
            style={{ marginBottom: "1rem" }}
          >
            <div>
              <h2 className="dashboard-card-title">Your Contracts</h2>
              <p className="dashboard-card-subtitle">
                {createdContracts.length} contract
                {createdContracts.length !== 1 ? "s" : ""} assigned to you
              </p>
            </div>
            <button className="btn-secondary" onClick={fetchContracts}>
              Refresh
            </button>
          </div>

          {loadingContracts ? (
            <div className="contracts-empty">
              <p>Loading contracts...</p>
            </div>
          ) : createdContracts.length === 0 ? (
            <div className="contracts-empty">
              <h3>No contracts yet</h3>
              <p>
                When an employer creates a contract for you, it will appear here
                for review.
              </p>
            </div>
          ) : (
            <div className="contracts-list">
              {createdContracts.map((contract, index) => (
                <article key={index} className="contract-card">
                  <div className="contract-details">
                    <div className="contract-field">
                      <label>Contract ID</label>
                      <span>{contract.ContractID}</span>
                    </div>
                    <div className="contract-field">
                      <label>Employer ID</label>
                      <span>{contract.EmployerId}</span>
                    </div>
                    <div className="contract-field">
                      <label>Payment</label>
                      <span>
                        {contract.Payment?.toLocaleString?.() ?? contract.Payment}
                      </span>
                    </div>
                    <div className="contract-field">
                      <label>Duration</label>
                      <span>{contract.Duration} months</span>
                    </div>
                    <div className="contract-field">
                      <label>Status</label>
                      <span
                        className={`status-badge ${getStatusClass(contract.STATUS)}`}
                      >
                        {contract.STATUS}
                      </span>
                    </div>
                  </div>

                  <div className="contract-actions">
                    <button
                      className="btn-accept"
                      disabled={contract.STATUS !== "Pending"}
                      onClick={() => handleAccept(contract.ContractID)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn-revoke"
                      disabled={contract.STATUS === "Revoked"}
                      onClick={() => handleRevoke(contract.ContractID)}
                    >
                      Revoke
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default UserHome;
