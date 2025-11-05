# Decentralized Student Transcript Ledger

A full-stack blockchain-based application for managing, verifying, and sharing student academic transcripts using IPFS (Pinata) for decentralized storage and MongoDB for metadata management.

## 🚀 Features

- **Role-Based Access**: Separate dashboards for Students and Institutions
- **IPFS Integration**: Documents stored on Pinata IPFS with automatic hash generation
- **Student Management**: Institutions can create and manage student records
- **Transcript Upload**: Upload PDF transcripts to IPFS with metadata tracking
- **Verification System**: Institutions can verify student transcripts
- **Request System**: Students can request transcripts from institutions
- **PDF Viewer**: In-page PDF viewer using IPFS gateway URLs
- **Search Functionality**: Search students by PRN
- **No Password Validation**: Demo mode - any password works (for development)

## 📁 Project Structure

```
Decentralized-Student-Transcript-Ledger/
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/         # Database, Pinata configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Upload middleware
│   │   └── scripts/        # Seed script
│   └── package.json
├── frontend/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── utils/          # API utilities, storage
│   │   └── theme/          # Material UI themes
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **Pinata SDK** - IPFS file storage
- **Multer** - File upload handling

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Material UI** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client

## 📋 Prerequisites

- Node.js 16+ and npm
- MongoDB Atlas account (free tier works)
- Pinata account (free tier works)
- Git

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Decentralized-Student-Transcript-Ledger
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd server
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/transcript-ledger?retryWrites=true&w=majority

# Pinata IPFS Configuration
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_API_KEY=your_pinata_secret_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

#### Get MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster
4. Go to "Database Access" → Create a database user
5. Go to "Network Access" → Add IP address (0.0.0.0/0 for development)
6. Go to "Database" → Click "Connect" → Copy connection string
7. Replace `<password>` with your database user password
8. Paste in `.env` as `MONGO_URI`

#### Get Pinata API Keys

1. Go to [Pinata.cloud](https://pinata.cloud)
2. Sign up for a free account
3. Verify your email
4. Go to Dashboard → API Keys
5. Click "New Key"
6. Give it a name (e.g., "Transcript Ledger")
7. Select permissions: "pinFileToIPFS" (at minimum)
8. Copy the `API Key` and `Secret API Key`
9. Paste in `.env` as `PINATA_API_KEY` and `PINATA_SECRET_API_KEY`

#### Seed the Database (Optional)

```bash
npm run seed
```

This creates sample students, transcripts, and requests.

#### Start the Server

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd ../frontend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

#### Start the Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🎯 Usage Guide

### Student Flow

1. **Login**: Go to landing page → Click "Student Login"
2. **Enter PRN or Wallet ID**: Use any password (e.g., `STU2024001`)
3. **View Transcripts**: See all your transcripts in the dashboard
4. **View Document**: Click "View" to see PDF in embedded viewer
5. **Download**: Click "Download" to get PDF from IPFS
6. **Request Transcript**: Click "Request Transcript" to create a new request

### Institution Flow

1. **Login**: Go to landing page → Click "Institution Login"
2. **Enter Institution Name**: Use any password
3. **Create Student**: Click "Create Student" → Fill form → Submit
4. **Upload Transcript**: Click "Create Transcript" → Select student → Upload PDF → Submit
5. **Verify Transcripts**: Go to Transcripts tab → Click verify icon
6. **View Requests**: Go to Requests tab → Process student requests
7. **Search Student**: Go to Search tab → Enter PRN → View student profile

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login (no password validation)

### Students
- `POST /api/students` - Create student
- `GET /api/students/:prn` - Get student by PRN
- `GET /api/students?walletId=<wallet>` - Get student by wallet ID
- `GET /api/students/all` - Get all students

### Transcripts
- `POST /api/transcripts/upload` - Upload transcript (multipart/form-data)
- `GET /api/transcripts/:id` - Get transcript by ID
- `GET /api/transcripts/student/:prn` - Get transcripts by student PRN
- `GET /api/transcripts?walletId=<wallet>` - Get transcripts by wallet ID
- `POST /api/transcripts/:id/verify` - Verify transcript

### Requests
- `POST /api/requests` - Create request
- `GET /api/requests/all` - Get all requests
- `GET /api/requests/student/:prn` - Get requests by student PRN
- `PUT /api/requests/:id/status` - Update request status

## 🗄️ Database Schemas

### Student
```javascript
{
  name: String,
  prn: String (unique),
  walletId: String,
  branch: String,
  createdAt: Date
}
```

### Transcript
```javascript
{
  studentPrn: String,
  studentName: String,
  walletId: String,
  branch: String,
  filename: String,
  ipfsHash: String (unique),
  ipfsUrl: String,
  status: "Pending" | "Verified" | "Rejected",
  uploadedAt: Date,
  verifiedAt: Date,
  verifiedBy: String
}
```

### Request
```javascript
{
  studentPrn: String,
  message: String,
  requestType: String,
  status: "Pending" | "Processed" | "Rejected",
  createdAt: Date,
  processedAt: Date,
  processedBy: String
}
```

## 🔒 Security Notes

⚠️ **This is a demo application. For production:**

- Implement proper authentication (JWT, OAuth, etc.)
- Add password validation and encryption
- Implement rate limiting
- Add input validation and sanitization
- Use HTTPS
- Implement proper error handling
- Add logging and monitoring
- Secure API keys and secrets

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error**
- Check your `MONGO_URI` in `.env`
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify database user credentials

**Pinata Upload Fails**
- Verify `PINATA_API_KEY` and `PINATA_SECRET_API_KEY` in `.env`
- Check API key permissions in Pinata dashboard
- Ensure file size is under 10MB

**Port Already in Use**
- Change `PORT` in `.env` to a different port
- Or stop the process using port 5000

### Frontend Issues

**API Connection Error**
- Ensure backend server is running
- Check `VITE_API_URL` in frontend `.env`
- Verify CORS is enabled in backend

**PDF Not Loading**
- Check IPFS gateway URL in transcript record
- Try accessing IPFS URL directly in browser
- Verify Pinata upload was successful

## 📝 Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is part of a blockchain learning project.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check console logs for errors
4. Open an issue on GitHub

## 🎓 Demo Instructions

See `demo-instructions.md` for detailed step-by-step demo walkthrough.

---

**Built with ❤️ for decentralized education**
