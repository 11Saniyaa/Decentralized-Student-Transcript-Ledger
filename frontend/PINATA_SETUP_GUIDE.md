# Pinata Free Plan Setup Guide

## Step 1: Create Pinata Account
1. Go to [Pinata.cloud](https://pinata.cloud)
2. Click "Sign Up" 
3. Use email or GitHub to create account
4. Verify your email if required

## Step 2: Get API Keys
1. After logging in, go to your **Dashboard**
2. Click on **"API Keys"** in the sidebar
3. Click **"New Key"** button
4. Give it a name like "Student Transcript Ledger"
5. Set permissions:
   - ✅ **PinFileToIPFS** (upload files)
   - ✅ **PinJSONToIPFS** (upload JSON)
   - ✅ **PinByHash** (pin existing files)
   - ✅ **Unpin** (remove pins)
6. Click **"Create Key"**
7. **IMPORTANT**: Copy both the **API Key** and **Secret Key** immediately (you won't see them again!)

## Step 3: Configure Your App
1. Create `.env` file in the `frontend/` directory:
   ```
   VITE_PINATA_API_KEY=your_api_key_here
   VITE_PINATA_SECRET_KEY=your_secret_key_here
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

## Step 4: Test Upload
1. Go to "Create Transcript" page
2. Upload a document
3. Check browser console - should see "Successfully uploaded to IPFS"
4. View transcript to see real IPFS link

## Pinata Free Plan Benefits
- ✅ **1GB storage**
- ✅ **1,000 pins**
- ✅ **Reliable file access**
- ✅ **No expiration**
- ✅ **Fast upload/download**

## Troubleshooting
- **"Pinata API keys not configured"** → Check your `.env` file
- **"Pinata API error: 401"** → Invalid API keys
- **"Pinata API error: 403"** → Check key permissions
- Files not accessible → Wait a few minutes for IPFS propagation
