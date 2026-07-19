# BorderPay.io

> A blockchain-powered cross-border payment platform built on **Hyperledger Fabric** for secure employer–employee payroll and contract management.

**CS731 End Term Project · IIT Kanpur**

---

## Overview

BorderPay enables employers and employees to create accounts, manage smart contracts, and execute cross-border payments — all recorded on a tamper-proof distributed ledger. The system uses a React frontend, a Go REST API, and two chaincodes deployed on a multi-org Fabric test network.

### Key Features

- **User management** — Employer and employee registration with role-based access
- **Smart contracts** — On-chain employment contracts with configurable payment terms
- **Cross-border payments** — Multi-currency support (INR, USD) via integrated bank accounts
- **Blockchain security** — All transactions recorded on Hyperledger Fabric with private data collections
- **REST API gateway** — Go server bridging the frontend to Fabric chaincodes

---

## Architecture

```
┌─────────────────────┐       ┌─────────────────────┐       ┌──────────────────────────────┐
│   React Frontend    │ HTTP  │   Go REST API       │ gRPC  │   Hyperledger Fabric Network │
│   (port 3000)       │──────▶│   (port 3002)       │──────▶│   Org1 + Org2 · CouchDB     │
└─────────────────────┘       └─────────────────────┘       └──────────────────────────────┘
                                                                        │
                                                              ┌─────────┴─────────┐
                                                              │  basictest        │
                                                              │  paytest          │
                                                              │  (chaincodes)     │
                                                              └───────────────────┘
```

| Layer | Technology | Port |
|-------|-----------|------|
| Frontend | React 18 | `3000` |
| REST API | Go + Fabric Gateway SDK | `3002` |
| Blockchain | Hyperledger Fabric 2.5.x | `7050`, `7051`, `9051` |
| State DB | CouchDB | `5984` |

---

## Prerequisites

| Tool | Version | Link |
|------|---------|------|
| Docker | Latest | [Install Docker](https://docs.docker.com/engine/install/) |
| Docker Compose | v2+ | [Install Compose](https://docs.docker.com/compose/install/) |
| Go | ≥ 1.20 | [Install Go](https://golang.org/doc/install) |
| Node.js | ≥ 18 LTS | [Install Node.js](https://nodejs.org/) |
| npm | Latest | Bundled with Node.js |
| Git | Latest | [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) |

> **Note:** Docker Desktop must be running before starting the Fabric network.

For Fabric-specific setup, see the [Hyperledger Fabric documentation](https://hyperledger-fabric.readthedocs.io/en/latest/getting_started.html).

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/tanmey21/BorderPay.io.git
cd BorderPay.Io
```

## Running the Project

You need **three terminals** — one for the blockchain network, one for the API, and one for the frontend. All paths below are relative to the repo root (`BorderPay.io/`).

### Terminal 1 — Start the Fabric network

```bash
cd fabric-samples/test-network

# Tear down any existing network
./network.sh down

# Start network with CouchDB and Certificate Authority
./network.sh up createChannel -c mychannel -ca -s couchdb
```

Deploy both chaincodes:

```bash
# basictest — user management & authentication
./network.sh deployCC \
  -ccn basictest \
  -ccp ../borderpay/chaincode-go \
  -ccl go \
  -ccep "OR('Org1MSP.peer','Org2MSP.peer')" \
  -cccg '../borderpay/chaincode-go/collections_config.json'

# paytest — payments & smart contracts
./network.sh deployCC \
  -ccn paytest \
  -ccp ../borderpay/chaincode2-go \
  -ccl go \
  -ccep "OR('Org1MSP.peer','Org2MSP.peer')" \
  -cccg '../borderpay/chaincode2-go/collections2_config.json'
```

Initialize the payment ledger:

```bash
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer chaincode invoke \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
  -C mychannel \
  -n paytest \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
  -c '{"function":"InitLedger","Args":[]}'
```

### Terminal 2 — Start the REST API

```bash
cd fabric-samples/borderpay/rest-api-go
go mod download
go run main.go
```

The API server starts on **http://localhost:3002**.

### Terminal 3 — Start the frontend

```bash
cd Blockchain_frontend
npm install
npm start
```

Open **http://localhost:3000** in your browser.

---

## Usage

1. **Sign up** as an Employer or Employee with your bank details
2. **Employers** can create payment contracts and send cross-border payments
3. **Employees** can view contracts, accept terms, and track incoming payments
4. All transactions are recorded on the Hyperledger Fabric ledger

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `infoln: command not found` | Ensure `fabric-samples/test-network/scripts/` exists; re-run the Fabric install script |
| `ERR_OSSL_EVP_UNSUPPORTED` on `npm start` | Use Node 18/20 LTS or upgrade to `react-scripts@5.x` |
| Port 3000 already in use | Run `kill -9 $(lsof -t -i:3000)` |
| Docker not running | Start Docker Desktop before `./network.sh up` |
| Chaincode deploy fails | Run `./network.sh down` first, then restart the network |
| API can't connect to peer | Ensure the Fabric network is running and env vars are exported |

---

## Team

| Name | Roll Number |
|------|-------------|
| Havi Bohra | 210429 |
| Satyam Gupta | 210942 |
| Tanmey Agarwal | 211098 |

---

## References

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/en/latest/)
- [Fabric Test Network Guide](https://hyperledger-fabric.readthedocs.io/en/latest/test_network.html)
- [Hyperledger Fabric Samples](https://github.com/hyperledger/fabric-samples)
