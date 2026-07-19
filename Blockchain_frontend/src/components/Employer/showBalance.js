import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { parseQueryResponse } from "../../utils/parseQueryResponse";

const BANK_NAMES = {
  PNB: "Punjab National Bank",
  SBI: "State Bank of India",
  BNY: "Bank of New York",
  Barclays: "Barclays",
};

const getBankDisplayName = (code) =>
  BANK_NAMES[code] ? `${BANK_NAMES[code]} (${code})` : code;

const ShowBalance = ({ logeduserid }) => {
  const [bankDetails, setBankDetails] = useState(null);
  const [loadingBank, setLoadingBank] = useState(true);
  const [showBalance, setShowBalance] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    const fetchBankDetails = async () => {
      setLoadingBank(true);
      try {
        const response = await axios.get("http://localhost:3002/query", {
          params: {
            channelid: "mychannel",
            chaincodeid: "basictest",
            function: "GetBankDetails",
            args: logeduserid,
          },
        });

        const jsonData = parseQueryResponse(response.data);
        if (jsonData?.[0]) {
          setBankDetails(jsonData[0]);
        }
      } catch (error) {
        console.error("Failed to fetch bank details:", error);
      } finally {
        setLoadingBank(false);
      }
    };

    if (logeduserid) {
      fetchBankDetails();
    }
  }, [logeduserid]);

  const fetchBalance = async () => {
    if (!bankDetails) return;

    setLoadingBalance(true);
    try {
      const params = new URLSearchParams();
      params.append("channelid", "mychannel");
      params.append("chaincodeid", "paytest");
      params.append("function", "ViewBalance");
      params.append("args", bankDetails.BankName);
      params.append("args", bankDetails.BankAccountNumber);

      const response = await axios.get("http://localhost:3002/query", {
        params,
      });

      const jsonData = parseQueryResponse(response.data);
      setBalance(jsonData);
      setShowBalance(true);
    } catch (error) {
      toast.error("Could not fetch balance");
      console.error("Failed to fetch balance:", error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleToggle = () => {
    if (showBalance) {
      setShowBalance(false);
      return;
    }
    fetchBalance();
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div>
          <h2 className="dashboard-card-title">Bank Account</h2>
          <p className="dashboard-card-subtitle">
            Your linked account on the ledger
          </p>
        </div>
        <button
          className="btn-secondary"
          onClick={handleToggle}
          disabled={loadingBalance || !bankDetails}
        >
          {loadingBalance
            ? "Loading..."
            : showBalance
            ? "Hide Balance"
            : "View Balance"}
        </button>
      </div>

      <div className="balance-card-body">
        {loadingBank ? (
          <p className="bank-info-loading">Loading account details...</p>
        ) : bankDetails ? (
          <div className="bank-info">
            <div className="bank-info-row">
              <label>Bank</label>
              <span>{getBankDisplayName(bankDetails.BankName)}</span>
            </div>
            <div className="bank-info-row">
              <label>Account Number</label>
              <span>{bankDetails.BankAccountNumber}</span>
            </div>
          </div>
        ) : (
          <p className="bank-info-loading">Bank account not found.</p>
        )}

        {showBalance && balance !== null ? (
          <>
            <div className="balance-divider" />
            <p className="balance-label">Available balance</p>
            <p className="balance-amount">
              {typeof balance === "number"
                ? balance.toLocaleString()
                : balance}
            </p>
          </>
        ) : (
          !loadingBank &&
          bankDetails && (
            <p className="balance-placeholder">
              Click &ldquo;View Balance&rdquo; to load your account balance.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default ShowBalance;
