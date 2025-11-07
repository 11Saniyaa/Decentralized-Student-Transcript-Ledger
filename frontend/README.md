# Student Transcript Ledger - Frontend

A modern, professional ERP-style dashboard for managing student academic transcripts on the blockchain. Built with React, Vite, and Material UI.

## Features

- 🔐 **Role-based Authentication** - Student and Institution login
- 📊 **Dashboard Views** - Separate dashboards for students and institutions
- 📄 **Document Management** - Upload, view, and track academic transcripts
- ✅ **Verification System** - Institutions can verify student documents
- 🔗 **IPFS Integration** - Documents stored on IPFS with blockchain hash tracking
- 📝 **Transaction Log** - View all blockchain transactions
- 👤 **Profile Management** - User profile pages
- 🌓 **Dark/Light Mode** - Toggle between themes
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Material UI (MUI)** - Component library
- **React Router** - Navigation
- **IPFS** - Decentralized file storage
- **localStorage** - Client-side data persistence

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, for IPFS configuration):
```bash
cp env.example .env
```

4. Edit `.env` and add your IPFS credentials (optional):
```env
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_WEB3_STORAGE_TOKEN=your_web3_storage_token
```

> **Note:** The app works without IPFS configuration using a fallback system. You can configure IPFS later for production use.

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the production bundle:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   └── TopNavbar.jsx    # Top navigation bar
│   ├── pages/               # Page components
│   │   ├── Login.jsx        # Login page
│   │   ├── StudentDashboard.jsx
│   │   ├── StudentDocuments.jsx
│   │   ├── InstitutionDashboard.jsx
│   │   ├── InstitutionRequests.jsx
│   │   ├── Profile.jsx
│   │   └── TransactionLog.jsx
│   ├── data/                # Dummy data generators
│   │   └── dummyData.js
│   ├── lib/                 # Utility libraries
│   │   ├── ipfs.js          # IPFS upload functions
│   │   └── contract.js       # Smart contract interaction
│   ├── theme/               # Theme configuration
│   │   └── theme.js         # Light/dark themes
│   ├── utils/               # Utility functions
│   │   └── storage.js       # localStorage helpers
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## Usage

### Login

1. Open the application
2. Select your role (Student or Institution)
3. Enter any email address (demo mode)
4. Click "Login"

### Student Features

- **Dashboard**: View statistics and upload transcripts
- **My Documents**: View all uploaded documents with IPFS and blockchain hashes
- **Transaction Log**: View all blockchain transactions
- **Profile**: View and manage profile information

### Institution Features

- **Dashboard**: View verification requests and statistics
- **Verification Requests**: Verify or reject student document requests
- **Upload New Record**: Add new student records
- **Transaction Log**: View all blockchain transactions
- **Profile**: View institution information

### IPFS Integration

The app includes multiple IPFS upload methods with automatic fallback:

1. **Pinata API** (requires API keys)
2. **IPFS Gateway** (public gateways)
3. **Web3.Storage** (requires token)
4. **Fallback** (demo mode - generates mock hashes)

If no IPFS configuration is provided, the app will use the fallback method to generate demo hashes, ensuring the app works out of the box.

## Configuration

### IPFS Setup (Optional)

#### Pinata Setup

1. Sign up at [Pinata](https://pinata.cloud)
2. Get your API key and secret
3. Add to `.env`:
   ```env
   VITE_PINATA_API_KEY=your_key
   VITE_PINATA_SECRET_KEY=your_secret
   ```

#### Web3.Storage Setup

1. Sign up at [Web3.Storage](https://web3.storage)
2. Get your API token
3. Add to `.env`:
   ```env
   VITE_WEB3_STORAGE_TOKEN=your_token
   ```

## Development

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add route in `src/main.jsx`
3. Add menu item in `src/components/Sidebar.jsx` if needed

### Styling

The app uses Material UI's theme system. Customize themes in `src/theme/theme.js`.

### Data Persistence

All data is stored in `localStorage`. Check `src/utils/storage.js` for storage utilities.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### IPFS Upload Fails

- Check your internet connection
- Verify IPFS API keys in `.env`
- The app will use fallback mode if all methods fail

### Data Not Persisting

- Clear browser cache and localStorage
- Check browser console for errors
- Ensure localStorage is enabled

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (requires 16+)

## License

This project is part of the Decentralized Student Transcript Ledger system.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions, please open an issue on GitHub.


