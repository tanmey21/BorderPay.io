import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { parseQueryResponse } from "../../utils/parseQueryResponse";
import { getRunBookLogs } from "../../utils/runBookStorage";

const BANK_NAMES = {
  PNB: "Punjab National Bank",
  SBI: "State Bank of India",
  BNY: "Bank of New York",
  Barclays: "Barclays",
  BOA: "Bank of America",
  RBI: "Reserve Bank of India",
  Exchange: "Exchange",
};

const formatBank = (code) => BANK_NAMES[code] || code;

const formatTimestamp = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const findContractForTx = (tx, contracts, role) => {
  if (!contracts?.length) return null;

  return contracts.find((c) => {
    const employerMatch =
      c.BankName_Employer === tx.Sender_Bank &&
      c.BankAccountNumber_Employer === tx.Sender_Acc_No;
    const employeeMatch =
      c.BankName_Employee === tx.Receiver_Bank &&
      c.BankAccountNumber_Employee === tx.Receiver_Acc_No;

    return role === "employer" ? employerMatch && employeeMatch : employeeMatch;
  });
};

const buildLedgerEntries = (transactions, contracts, role, bankDetails) => {
  return transactions.map((tx) => {
    const contract = findContractForTx(tx, contracts, role);
    const isOutgoing =
      tx.Sender_Bank === bankDetails?.BankName &&
      tx.Sender_Acc_No === bankDetails?.BankAccountNumber;

    return {
      id: `ledger-${tx.Transaction_ID}`,
      source: "ledger",
      timestamp: tx.Timestamp || null,
      event: isOutgoing ? "payment_sent" : "payment_received",
      paymentTxId: tx.Transaction_ID,
      amount: tx.Amount,
      currency: tx.Currency,
      senderBank: tx.Sender_Bank,
      senderAccount: tx.Sender_Acc_No,
      receiverBank: tx.Receiver_Bank,
      receiverAccount: tx.Receiver_Acc_No,
      contractId: contract?.ContractID || null,
      employerId: contract?.EmployerId || null,
      employeeId: contract?.EmployeeId || null,
      contractStatus: contract?.STATUS || null,
    };
  });
};

const buildLocalEntries = (localLogs) =>
  localLogs.map((log) => ({
    ...log,
    source: "runbook",
    timestamp: log.timestamp || log.recordedAt,
  }));

const buildContractEntries = (contracts) => {
  const entries = [];

  contracts.forEach((contract) => {
    (contract.All_Transactions || []).forEach((tx) => {
      entries.push({
        id: `contract-${contract.ContractID}-${tx.Transaction_ID}`,
        source: "contract",
        timestamp: tx.Update_Time_Stamp || tx.Origin_Time_Stamp || null,
        event: "contract_payment",
        paymentTxId: tx.Transaction_ID,
        amount: tx.Amount,
        currency: null,
        senderBank: tx.Source_Bank,
        senderAccount: tx.Source_Bank_Account_No,
        receiverBank: tx.Receiver_Bank,
        receiverAccount: tx.Receiver_Bank_Account_No,
        contractId: contract.ContractID,
        employerId: contract.EmployerId,
        employeeId: contract.EmployeeId,
        contractStatus: tx.Status || contract.STATUS,
        fabricTxId: null,
      });
    });
  });

  return entries;
};

const filterTransactionsForAccount = (transactions, bankDetails) =>
  (transactions ?? []).filter(
    (tx) =>
      (tx.Sender_Bank === bankDetails.BankName &&
        tx.Sender_Acc_No === bankDetails.BankAccountNumber) ||
      (tx.Receiver_Bank === bankDetails.BankName &&
        tx.Receiver_Acc_No === bankDetails.BankAccountNumber)
  );

const fetchLedgerTransactions = async (bankDetails) => {
  const accountParams = new URLSearchParams();
  accountParams.append("channelid", "mychannel");
  accountParams.append("chaincodeid", "paytest");
  accountParams.append("function", "GetTransactionsByAccount");
  accountParams.append("args", bankDetails.BankName);
  accountParams.append("args", bankDetails.BankAccountNumber);

  try {
    const byAccount = await axios.get("http://localhost:3002/query", {
      params: accountParams,
    });
    return parseQueryResponse(byAccount.data) ?? [];
  } catch (byAccountError) {
    console.warn(
      "GetTransactionsByAccount unavailable, falling back to GetAllTransactions:",
      byAccountError
    );
  }

  const allParams = new URLSearchParams();
  allParams.append("channelid", "mychannel");
  allParams.append("chaincodeid", "paytest");
  allParams.append("function", "GetAllTransactions");

  const allTx = await axios.get("http://localhost:3002/query", {
    params: allParams,
  });

  return filterTransactionsForAccount(
    parseQueryResponse(allTx.data) ?? [],
    bankDetails
  );
};

const mergeRunBookEntries = (...groups) => {
  const seen = new Set();
  const merged = [];

  groups.flat().forEach((entry) => {
    const key =
      entry.paymentTxId && entry.contractId
        ? `${entry.paymentTxId}-${entry.contractId}`
        : entry.id;

    if (seen.has(key)) return;
    seen.add(key);
    merged.push(entry);
  });

  return merged.sort((a, b) => {
    const aTime = new Date(a.timestamp || 0).getTime();
    const bTime = new Date(b.timestamp || 0).getTime();
    return bTime - aTime;
  });
};

const RunBookLog = ({ logeduserid, role, contracts = [], refreshKey = 0 }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRunBook = useCallback(async () => {
    if (!logeduserid) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const bankResponse = await axios.get("http://localhost:3002/query", {
        params: {
          channelid: "mychannel",
          chaincodeid: "basictest",
          function: "GetBankDetails",
          args: logeduserid,
        },
      });

      const bankDetails = parseQueryResponse(bankResponse.data)?.[0];
      let ledgerEntries = [];

      if (bankDetails) {
        const transactions = await fetchLedgerTransactions(bankDetails);
        ledgerEntries = buildLedgerEntries(
          transactions,
          contracts,
          role,
          bankDetails
        );
      }

      const localEntries = buildLocalEntries(getRunBookLogs(logeduserid));
      const contractEntries = buildContractEntries(contracts);

      setEntries(
        mergeRunBookEntries(ledgerEntries, localEntries, contractEntries)
      );
    } catch (error) {
      console.error("Failed to load run-book logs:", error);
      setEntries(buildLocalEntries(getRunBookLogs(logeduserid)));
    } finally {
      setLoading(false);
    }
  }, [logeduserid, role, contracts]);

  useEffect(() => {
    fetchRunBook();
  }, [fetchRunBook, refreshKey]);

  const getEventLabel = (entry) => {
    if (entry.event === "payment_sent") return "Payment Sent";
    if (entry.event === "payment_received") return "Payment Received";
    if (entry.event === "contract_payment") return "Contract Payment";
    return "Payment Event";
  };

  return (
    <section className="runbook-section">
      <div className="dashboard-card-header" style={{ marginBottom: "1rem" }}>
        <div>
          <h2 className="dashboard-card-title">Run-Book Log</h2>
          <p className="dashboard-card-subtitle">
            Payment history with timestamps and ledger metadata
          </p>
        </div>
        <button className="btn-secondary" onClick={fetchRunBook}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="contracts-empty">
          <p>Loading run-book entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="contracts-empty">
          <h3>No payment logs yet</h3>
          <p>
            {role === "employer"
              ? "Send a payment from an accepted contract to record it here."
              : "Incoming payments from your employer will appear here."}
          </p>
        </div>
      ) : (
        <div className="runbook-list">
          {entries.map((entry) => (
            <article key={entry.id} className="runbook-entry">
              <div className="runbook-entry-header">
                <div>
                  <span
                    className={`runbook-event runbook-event-${entry.event}`}
                  >
                    {getEventLabel(entry)}
                  </span>
                  <p className="runbook-timestamp">
                    {formatTimestamp(entry.timestamp)}
                  </p>
                </div>
                <div className="runbook-amount">
                  {entry.amount?.toLocaleString?.() ?? entry.amount}{" "}
                  {entry.currency || ""}
                </div>
              </div>

              <div className="runbook-meta-grid">
                {entry.paymentTxId && (
                  <div className="runbook-meta-item">
                    <label>Payment TX ID</label>
                    <span>{entry.paymentTxId}</span>
                  </div>
                )}
                {entry.fabricTxId && (
                  <div className="runbook-meta-item">
                    <label>Fabric TX ID</label>
                    <span className="runbook-mono">{entry.fabricTxId}</span>
                  </div>
                )}
                {entry.contractId && (
                  <div className="runbook-meta-item">
                    <label>Contract ID</label>
                    <span>{entry.contractId}</span>
                  </div>
                )}
                {entry.employerId && (
                  <div className="runbook-meta-item">
                    <label>Employer ID</label>
                    <span>{entry.employerId}</span>
                  </div>
                )}
                {entry.employeeId && (
                  <div className="runbook-meta-item">
                    <label>Employee ID</label>
                    <span>{entry.employeeId}</span>
                  </div>
                )}
                {entry.senderBank && (
                  <div className="runbook-meta-item">
                    <label>From</label>
                    <span>
                      {formatBank(entry.senderBank)} · {entry.senderAccount}
                    </span>
                  </div>
                )}
                {entry.receiverBank && (
                  <div className="runbook-meta-item">
                    <label>To</label>
                    <span>
                      {formatBank(entry.receiverBank)} · {entry.receiverAccount}
                    </span>
                  </div>
                )}
                {entry.contractStatus && (
                  <div className="runbook-meta-item">
                    <label>Contract Status</label>
                    <span>{entry.contractStatus}</span>
                  </div>
                )}
                <div className="runbook-meta-item">
                  <label>Source</label>
                  <span className="runbook-source">{entry.source}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default RunBookLog;
