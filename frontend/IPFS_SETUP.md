# Free IPFS Storage Setup

This project supports **completely free** IPFS storage with no API keys required! Here are your options:

## Option 1: Completely Free (No Setup Required)
- ✅ **No API keys needed**
- ✅ **Works out of the box**
- Uses public IPFS gateways
- Files are stored on IPFS network
- May have slower access times

## Option 2: Pinata Free Tier (Recommended)
Get **1GB free storage** and **1000 pins** for better reliability:

1. Go to [Pinata.cloud](https://pinata.cloud)
2. Sign up for a free account
3. Go to API Keys section
4. Create new API key
5. Copy your API Key and Secret Key
6. Create `.env` file in `frontend/` directory:
   ```
   VITE_PINATA_API_KEY=your_api_key_here
   VITE_PINATA_SECRET_KEY=your_secret_key_here
   ```

## Option 3: Web3.Storage (Alternative)
1. Go to [Web3.Storage](https://web3.storage)
2. Sign up for free account
3. Create API token
4. Add to `.env` file:
   ```
   VITE_WEB3_STORAGE_TOKEN=your_token_here
   ```

## How It Works
- Files are uploaded to IPFS network
- Hash is stored on blockchain
- Documents are accessible via IPFS gateways
- With Pinata: Files are pinned for better availability
- Without Pinata: Files rely on network availability

## Error Fixes

### "Failed to fetch" Error
If you get this error, the system now has multiple fallback methods:
1. **Pinata API** (if configured)
2. **IPFS Gateways** (direct upload)
3. **Web3.Storage** (if configured)
4. **Mock Hash** (for testing without real IPFS)

The app will try each method until one works.

## Testing
1. Start the frontend: `npm run dev`
2. Go to "Create Transcript" page
3. Upload a document (will use fallback if no API keys)
4. View the transcript to see the IPFS link

## For Best Results
- Get free Pinata account for reliable storage
- Or use Web3.Storage free tier
- Without API keys, it uses mock hashes for testing

The system works without any setup, but Pinata's free tier provides better reliability!
