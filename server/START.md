# Backend Server Startup Guide

## Quick Start

1. **Install Dependencies** (if not already done):
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment**:
   - Copy `env.example` to `.env` (if not exists)
   - Edit `.env` and add your MongoDB URI:
     ```
     MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/transcript-ledger?retryWrites=true&w=majority
     ```
   - Optionally add Pinata keys (server will work without them using fallback mode)

3. **Start Server**:
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

4. **Verify Server**:
   - Open browser: http://localhost:5000/api/health
   - Should see: `{"status":"OK","message":"Server is running"}`

## Troubleshooting

### Server won't start
- Check if port 5000 is available
- Check Node.js version (should be 16+)
- Check `.env` file exists in `server` folder

### MongoDB Connection Error
- Server will still start but database operations will fail
- Check your MONGO_URI in `.env`
- Verify MongoDB Atlas IP whitelist (add 0.0.0.0/0 for development)
- Check database user credentials

### Dependencies Missing
```bash
npm install
```

### Port Already in Use
Change PORT in `.env`:
```
PORT=5001
```

## Common Issues

1. **Module not found**: Run `npm install`
2. **MongoDB connection failed**: Server will still run in demo mode
3. **Port in use**: Change PORT in `.env` file
4. **CORS errors**: Check frontend is connecting to correct port


