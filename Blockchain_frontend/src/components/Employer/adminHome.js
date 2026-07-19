import React, { useCallback, useEffect, useState } from "react";
import AdminNavbar from "./adminNavbar";
import axios from "axios";
import CreateContract from "./createContract";
import toast from "react-hot-toast";
import ShowBalance from "./showBalance";
import { parseQueryResponse } from "../../utils/parseQueryResponse";
import "./employerDashboard.css";

const getStatusClass = (status) => {
  if (status === "Pending") return "status-pending";
  if (status === "Accepted") return "status-accepted";
  if (status === "Revoked") return "status-revoked";
  return "status-default";
};

const AdminHome = () => {
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

  const handlePayment = async (b1, bn1, b2, bn2, pay, status) => {
    if (status === "Pending" || status === "Revoked") {
      toast.error("Contract is inactive");
      return;
    }
    try {
      await axios.post(
        "http://localhost:3002/invoke",
        new URLSearchParams([
          ["", ""],
          ["channelid", "mychannel"],
          ["chaincodeid", "paytest"],
          ["function", "MakePayment"],
          ["args", b1],
          ["args", bn1],
          ["args", b2],
          ["args", bn2],
          ["args", pay],
        ])
      );
      toast.success("Payment successful");
    } catch (error) {
      toast.error("Payment failed");
      console.error("Error making payment:", error);
    }
  };

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
      toast.error("Revoke failed");
      console.error("Error making revoke", error);
    }
  };

  const isPaymentDisabled = (status) =>
    status === "Pending" || status === "Revoked";

  return (
    <div className="employer-page">
      <AdminNavbar />

      <main className="employer-main">
        <header className="employer-header">
          <div>
            <h1>Employer Dashboard</h1>
            <p>Manage contracts and send cross-border payments to your team.</p>
          </div>
          <div className="employer-user-badge">
            Signed in as <span>{logeduserid}</span>
          </div>
        </header>

        <div className="employer-grid">
          <CreateContract onContractCreated={fetchContracts} />
          <ShowBalance logeduserid={logeduserid} />
        </div>

        <section className="contracts-section">
          <div className="dashboard-card-header" style={{ marginBottom: "1rem" }}>
            <div>
              <h2 className="dashboard-card-title">Your Contracts</h2>
              <p className="dashboard-card-subtitle">
                {createdContracts.length} active agreement
                {createdContracts.length !== 1 ? "s" : ""} on the ledger
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
              <p>Create your first contract above to start paying employees.</p>
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
                      <label>Employee ID</label>
                      <span>{contract.EmployeeId}</span>
                    </div>
                    <div className="contract-field">
                      <label>Payment</label>
                      <span>{contract.Payment?.toLocaleString?.() ?? contract.Payment}</span>
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
                      className="btn-pay"
                      disabled={isPaymentDisabled(contract.STATUS)}
                      onClick={() =>
                        handlePayment(
                          contract.BankName_Employer,
                          contract.BankAccountNumber_Employer,
                          contract.BankName_Employee,
                          contract.BankAccountNumber_Employee,
                          contract.Payment,
                          contract.STATUS
                        )
                      }
                    >
                      Send Payment
                    </button>
                    <button
                      className="btn-revoke"
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

export default AdminHome;
