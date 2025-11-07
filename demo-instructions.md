# Demo Instructions - Student Transcript Ledger

This document provides step-by-step instructions for demonstrating the full functionality of the Decentralized Student Transcript Ledger application.

## Prerequisites

Before starting the demo, ensure:
1. Backend server is running on `http://localhost:5000`
2. Frontend server is running on `http://localhost:5173`
3. MongoDB is connected and seeded (optional but recommended)
4. Pinata API keys are configured

## Demo Scenario: Complete Workflow

### Part 1: Institution Setup (Creating a Student and Uploading Transcript)

#### Step 1: Login as Institution

1. Open browser and navigate to `http://localhost:5173`
2. You'll see the landing page with two options
3. Click **"Institution Login"** button
4. In the login form:
   - **Institution Name**: Enter `Tech University` (or any name)
   - **Password**: Enter any password (e.g., `password123`)
5. Click **"Login"**
6. You should be redirected to the Institution Dashboard

#### Step 2: Create a New Student

1. In the Institution Dashboard, click **"Create Student"** button (top right)
2. Fill in the form:
   - **Student Name**: `John Doe`
   - **PRN (Enrollment Number)**: `STU2025001`
   - **Wallet ID**: `0x1234567890123456789012345678901234567890`
   - **Branch**: `Computer Science` (optional)
3. Click **"Create Student"**
4. You should see a success message
5. The student is now created in the database

#### Step 3: Upload a Transcript

1. Still in the Institution Dashboard, click **"Create Transcript"** button
2. Fill in the transcript form:
   - **Student PRN**: `STU2025001` (the student you just created)
   - **Student Name**: `John Doe`
   - **Branch**: `Computer Science`
   - **Wallet ID**: `0x1234567890123456789012345678901234567890`
   - **File**: Click "Select PDF File" and choose a PDF file (any PDF will work for demo)
3. Click **"Upload Transcript"**
4. Wait for upload to complete (this uploads to Pinata IPFS)
5. You should see a success message with the IPFS hash
6. The transcript will appear in the "Transcripts" tab

#### Step 4: Verify the Transcript

1. Click on the **"Transcripts"** tab (if not already selected)
2. Find the transcript you just uploaded
3. You'll see a green checkmark icon in the Actions column
4. Click the **checkmark icon** to verify the transcript
5. The status should change from "Pending" to "Verified"
6. You should see a success message

---

### Part 2: Student Experience (Viewing and Requesting Transcripts)

#### Step 5: Login as Student

1. Click the **logout** button (top right menu) or navigate to `/login`
2. You'll return to the landing page
3. Click **"Student Login"** button
4. In the login form:
   - **PRN or Wallet ID**: Enter `STU2025001` (the PRN we created earlier)
   - **Password**: Enter any password (e.g., `student123`)
5. Click **"Login"**
6. You should be redirected to the Student Dashboard

#### Step 6: View Transcripts

1. In the Student Dashboard, you'll see a table of all transcripts
2. The transcript you uploaded should be visible with:
   - Filename
   - Branch
   - Upload date
   - Status (should show "Verified")
3. You can see all your transcripts in one place

#### Step 7: View PDF Document

1. In the transcripts table, find the transcript you want to view
2. Click the **eye icon** (View button) in the Actions column
3. You'll be taken to the Transcript Viewer page
4. The PDF will be embedded in the page using the IPFS gateway URL
5. You can scroll through the PDF directly in the browser
6. Click **"Download"** button to download the PDF file

#### Step 8: Request a New Transcript

1. Go back to the Student Dashboard (click back or navigate)
2. Click the **"Request Transcript"** button (top right)
3. A modal will open
4. Enter a message: `Please upload my academic transcript for the year 2024`
5. Click **"Submit Request"**
6. You should see a success message
7. The request is now visible in the Institution Dashboard

---

### Part 3: Institution Processing Requests

#### Step 9: Process Student Request

1. Logout from student account (or open a new incognito window)
2. Login as Institution again (same credentials as Step 1)
3. In the Institution Dashboard, click the **"Requests"** tab
4. You should see the request from the student
5. The request shows:
   - Student PRN
   - Message
   - Status (Pending)
   - Created date
6. You can:
   - Click the **green checkmark** to mark as "Processed"
   - Click the **red X** to "Reject" the request
7. Click the checkmark to process the request
8. The status will change to "Processed"

---

### Part 4: Search Functionality

#### Step 10: Search for a Student

1. Still in Institution Dashboard, click the **"Search Student"** tab
2. In the search box, enter: `STU2025001`
3. Press Enter or click **"Search"**
4. You should see the student profile card showing:
   - Student name
   - PRN
   - Wallet ID
   - Branch
   - Associated transcripts (if any)
5. This is useful for institutions to quickly look up student information

---

### Part 5: Using Seed Data (Alternative Quick Demo)

If you ran the seed script, you can use pre-existing data:

#### Student Login with Seed Data

1. Login as Student with PRN: `STU2024001`
2. You'll see 2 pre-existing transcripts:
   - One verified transcript
   - One pending transcript
3. You can view, download, and request transcripts immediately

#### Institution Login with Seed Data

1. Login as Institution
2. You'll see:
   - Multiple transcripts in the Transcripts tab
   - Existing requests in the Requests tab
3. You can verify transcripts and process requests immediately

---

## Key Features Demonstrated

✅ **Student Creation**: Institutions can create student records
✅ **IPFS Upload**: PDFs are uploaded to Pinata IPFS
✅ **Transcript Management**: Full CRUD operations for transcripts
✅ **Verification System**: Institutions can verify documents
✅ **Request System**: Students can request transcripts
✅ **PDF Viewer**: In-page PDF viewing from IPFS gateway
✅ **Search**: Quick student lookup by PRN
✅ **Status Tracking**: Real-time status updates (Pending/Verified)

## Troubleshooting During Demo

### PDF Not Loading
- Check browser console for errors
- Verify IPFS gateway URL is accessible
- Try accessing IPFS URL directly in browser

### Upload Fails
- Check Pinata API keys in backend `.env`
- Verify file is PDF format
- Check file size (should be under 10MB)

### Student Not Found
- Ensure student was created first
- Check PRN spelling (case-insensitive but must match)
- Verify database connection

### Request Not Showing
- Refresh the page
- Check both student and institution are logged in correctly
- Verify request was created successfully

## Tips for Smooth Demo

1. **Prepare Sample PDFs**: Have a few PDF files ready for upload
2. **Use Seed Data**: Run `npm run seed` in server folder for quick demo
3. **Test IPFS**: Verify Pinata upload works before demo
4. **Clear Browser Cache**: If issues occur, clear localStorage
5. **Have Backup**: Keep backend logs visible to debug any issues

## Expected Demo Duration

- **Full Workflow**: 10-15 minutes
- **Quick Demo (with seed data)**: 5-7 minutes
- **Feature Showcase**: 3-5 minutes per feature

---

**Happy Demo! 🎓**


