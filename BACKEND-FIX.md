# Backend Server - Fix Guide

## ✅ Issues Fixed

1. **Dependencies installed** - All npm packages are now installed
2. **MongoDB connection** - Server starts even if MongoDB fails (graceful fallback)
3. **Environment variables** - `.env` file is properly configured
4. **Error handling** - Better error messages and logging
5. **Startup script** - Created `quick-start.bat` for Windows

## 🚀 How to Start Backend

### Option 1: Using npm script (Recommended)
```bash
cd server
npm run dev
```

### Option 2: Using quick start script (Windows)
```bash
cd server
quick-start.bat
```

### Option 3: Direct start
```bash
cd server
node src/server.js
```

## ✅ Verification

Once server starts, you should see:
```
🚀 Server running on port 5000
📝 Environment: development
🌐 API available at: http://localhost:5000/api
💚 Health check: http://localhost:5000/api/health
```

Test the server:
- Open browser: http://localhost:5000/api/health
- Should return: `{"status":"OK","message":"Server is running"}`

## 🔧 Troubleshooting

### Issue: "Cannot find module"
**Solution**: Install dependencies
```bash
cd server
npm install
```

### Issue: "Port 5000 already in use"
**Solution**: Change port in `.env`
```
PORT=5001
```
Then update frontend `.env`:
```
VITE_API_URL=http://localhost:5001/api
```

### Issue: "MongoDB connection failed"
**Solution**: 
- Server will still run! ✅
- Database operations won't work until MongoDB is connected
- Check your `MONGO_URI` in `.env` file
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`

### Issue: "EADDRINUSE" error
**Solution**: Kill the process using port 5000
```powershell
# Windows PowerShell
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

## 📝 Current Configuration

Your `.env` file has:
- ✅ MongoDB URI configured
- ✅ Pinata API keys configured
- ✅ Port: 5000

## 🎯 Next Steps

1. Start the backend server
2. Verify it's running: http://localhost:5000/api/health
3. Start the frontend: `cd frontend && npm run dev`
4. Test the application!

## 💡 Tips

- Server logs all errors to console
- Check browser console for frontend errors
- Check server terminal for backend errors
- MongoDB connection is optional - server works in demo mode

