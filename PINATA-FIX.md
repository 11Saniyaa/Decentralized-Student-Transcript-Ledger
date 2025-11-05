# Pinata IPFS Upload Fix Guide

## 🔧 Issue Fixed

The Pinata SDK was not properly reading credentials from the `.env` file. This has been fixed by:

1. **Proper credential validation** - Checks credentials before initialization
2. **Fresh instance per upload** - Creates new Pinata instance for each upload
3. **Better error messages** - Clear feedback when credentials are invalid
4. **Fallback mode** - Works without Pinata (demo mode) but warns user

## ✅ How to Verify Pinata is Working

### Step 1: Check Your .env File

Make sure your `server/.env` file has:
```env
PINATA_API_KEY=82795f347901f115c351
PINATA_SECRET_API_KEY=89860b54f4210d4f3e5cb399ac5f64462724305785fefb5ba7dcaa5ad5e10adb
```

### Step 2: Test Pinata Connection

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. Look for this message in the console:
   ```
   ✅ Pinata SDK initialized successfully
      API Key: 82795f3479...
   ```

3. If you see warnings, check your credentials

### Step 3: Upload a Test File

1. Go to Institution Dashboard
2. Click "Create Transcript"
3. Fill in the form and select a PDF
4. Click "Upload Transcript"

5. Check the server console - you should see:
   ```
   📤 Uploading file to Pinata: filename.pdf (195.29 KB)
   ✅ File uploaded to Pinata successfully!
      IPFS Hash: QmXXXXXXXXXXXXXXXXXXXXX
      Gateway URL: https://gateway.pinata.cloud/ipfs/QmXXXXXXXXXXXXXXXXXXXXX
   ```

### Step 4: Verify File is Accessible

After upload, the file should be accessible at:
- `https://gateway.pinata.cloud/ipfs/<CID>`
- `https://ipfs.io/ipfs/<CID>`

Try opening the URL in your browser - the PDF should load!

## 🐛 Troubleshooting

### Error: "No credentials provided"
**Solution**: 
1. Check `.env` file exists in `server` folder
2. Verify credentials don't have extra spaces
3. Restart the server after changing `.env`

### Error: "Failed to upload to Pinata"
**Possible causes**:
1. Invalid API keys - verify in Pinata dashboard
2. Network issue - check internet connection
3. Pinata service down - check Pinata status

### Files Not Accessible via Gateway
**Solution**:
1. Wait 1-2 minutes after upload (propagation delay)
2. Try different gateway: `https://ipfs.io/ipfs/<CID>`
3. Check if file was actually pinned in Pinata dashboard

## 📝 Pinata API Key Setup (If Needed)

1. Go to https://pinata.cloud
2. Sign in or create account
3. Go to **Dashboard → API Keys**
4. Click **"New Key"**
5. Give it a name (e.g., "Transcript Ledger")
6. Select permissions:
   - ✅ `pinFileToIPFS`
   - ✅ `pinJSONToIPFS` (optional)
7. Copy the **API Key** and **Secret API Key**
8. Add to `server/.env`:
   ```env
   PINATA_API_KEY=your_api_key_here
   PINATA_SECRET_API_KEY=your_secret_key_here
   ```
9. Restart the server

## ✅ Current Status

Your `.env` file already has Pinata credentials configured. The server should now:
- ✅ Read credentials properly
- ✅ Upload files to Pinata
- ✅ Generate accessible IPFS URLs
- ✅ Display files in the web viewer

## 🎯 Next Steps

1. **Restart the server** (if it's running)
2. **Upload a test transcript**
3. **Verify the file loads** in the PDF viewer
4. **Check the IPFS gateway URL** works in browser

The upload should now work perfectly! 🎉

