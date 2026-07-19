import React, { useCallback, useEffect, useRef, useState } from "react";
import AdminNavbar from "./adminNavbar";
import axios from "axios";
import CreateContract from "./createContract";
import toast from "react-hot-toast";
import ShowBalance from "./showBalance";
import RunBookLog from "../shared/RunBookLog";
import { parseQueryResponse } from "../../utils/parseQueryResponse";
import { parseInvokeResponse } from "../../utils/parseInvokeResponse";
import { appendRunBookLog } from "../../utils/runBookStorage";
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
  const [runBookRefreshKey, setRunBookRefreshKey] = useState(0);
  const [balanceRefreshKey, setBalanceRefreshKey] = useState(0);
  const balanceRef = useRef(null);

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

  const handlePayment = async (contract, pay, status) => {
    if (status === "Pending" || status === "Revoked") {
      toast.error("Contract is inactive");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3002/invoke",
        new URLSearchParams([
          ["", ""],
          ["channelid", "mychannel"],
          ["chaincodeid", "paytest"],
          ["function", "MakePayment"],
          ["args", contract.BankName_Employer],
          ["args", contract.BankAccountNumber_Employer],
          ["args", contract.BankName_Employee],
          ["args", contract.BankAccountNumber_Employee],
          ["args", pay],
        ])
      );

      const { fabricTxId, result } = parseInvokeResponse(response.data);

      appendRunBookLog(logeduserid, {
        event: "payment_sent",
        timestamp: new Date().toISOString(),
        fabricTxId,
        paymentTxId: result || null,
        contractId: contract.ContractID,
        employerId: contract.EmployerId || logeduserid,
        employeeId: contract.EmployeeId,
        amount: pay,
        senderBank: contract.BankName_Employer,
        senderAccount: contract.BankAccountNumber_Employer,
        receiverBank: contract.BankName_Employee,
        receiverAccount: contract.BankAccountNumber_Employee,
        contractStatus: contract.STATUS,
        role: "employer",
      });

      toast.success("Payment successful");
      setRunBookRefreshKey((key) => key + 1);
      setBalanceRefreshKey((key) => key + 1);
      balanceRef.current?.refreshBalance();
      fetchContracts();
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
          <ShowBalance
            ref={balanceRef}
            logeduserid={logeduserid}
            refreshKey={balanceRefreshKey}
          />
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
                      onClick={() => handlePayment(contract, contract.Payment, contract.STATUS)}
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

        <RunBookLog
          logeduserid={logeduserid}
          role="employer"
          contracts={createdContracts}
          refreshKey={runBookRefreshKey}
        />
      </main>
    </div>
  );
};

export default AdminHome;
