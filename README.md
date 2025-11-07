# Decentralized Student Transcript Ledger

A full-stack blockchain-based application for managing academic transcripts using IPFS storage and optional blockchain verification.

## 🌟 Features

- **Student Dashboard**: View transcripts, request new ones, download PDFs
- **Institution Dashboard**: Create students, upload transcripts, verify documents
- **IPFS Storage**: Files stored on Pinata IPFS network
- **Blockchain Integration**: Optional Ethereum smart contract integration
- **PDF Viewer**: Multiple gateway support for reliable file access
- **Request Management**: Student-request system for transcript requests

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)
- Pinata account (for IPFS storage)
- (Optional) Hardhat for blockchain deployment

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/11Saniyaa/Decentralized-Student-Transcript-Ledger.git
   cd Decentralized-Student-Transcript-Ledger
   ```

2. **Backend Setup**:
   ```bash
   cd server
   npm install
   cp env.example .env
   # Edit .env with your MongoDB URI and Pinata keys
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   npm run dev
   ```

## 📋 Environment Variables

### Backend (`server/.env`):
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/transcript-ledger
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
PORT=5000
NODE_ENV=development

# Optional Blockchain
ETH_PROVIDER_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x...
CONTRACT_PRIVATE_KEY=your_private_key
```

### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

## 🎯 Usage

1. **Start Backend**: `cd server && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Access**: http://localhost:5173

### Login
- **Student**: Use PRN (e.g., STU2024001) - any password works
- **Institution**: Use institution name - any password works

## 📁 Project Structure

```
Decentralized-Student-Transcript-Ledger/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utilities and API
│   │   └── theme/         # Material UI theme
│   └── package.json
├── server/             # Node.js + Express backend
│   ├── src/
│   │   ├── config/        # Database, Pinata, Blockchain config
│   │   ├── controllers/  # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   └── scripts/       # Seed and utility scripts
│   └── package.json
└── contracts/          # Solidity smart contracts
```

## 🔧 API Endpoints

- `POST /api/auth/login` - Login (no validation)
- `POST /api/students` - Create student
- `GET /api/students/:prn` - Get student by PRN
- `POST /api/transcripts/upload` - Upload transcript to IPFS
- `GET /api/transcripts/all` - Get all transcripts
- `GET /api/transcripts/student/:prn` - Get student transcripts
- `POST /api/transcripts/:id/verify` - Verify transcript
- `POST /api/requests` - Create request
- `GET /api/requests/all` - Get all requests

## 📝 Documentation

- [Complete Setup Guide](./COMPLETE-SETUP.md)
- [Blockchain Setup](./BLOCKCHAIN-SETUP.md)
- [Pinata IPFS Setup](./frontend/PINATA_SETUP_GUIDE.md)
- [IPFS Configuration](./frontend/IPFS_SETUP.md)
- [PDF Viewer Features](./PDF-VIEWER-FEATURES.md)
- [Demo Instructions](./demo-instructions.md)

## 🔒 Security Notes

- `.env` files are excluded from repository
- Never commit sensitive credentials
- Use environment variables for all secrets
- Login has no validation (demo mode only)

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Material UI, React Router
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **IPFS**: Pinata.cloud
- **Blockchain**: Solidity, Hardhat, Ethers.js (optional)

## 📄 License

ISC

## 👤 Author

11Saniyaa

## 🙏 Acknowledgments

Built as a decentralized transcript management system using blockchain and IPFS technologies.
