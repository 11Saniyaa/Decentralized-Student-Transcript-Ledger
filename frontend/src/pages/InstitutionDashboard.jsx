import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { getUser, getVerificationRequests, updateVerificationRequest, addVerificationRequest, addTransaction } from '../utils/storage';
import { generateDummyVerificationRequests } from '../data/dummyData';

export default function InstitutionDashboard() {
  const user = getUser();
  const [requests, setRequests] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    studentId: '',
    studentName: '',
    documentName: '',
    documentType: 'Transcript',
    ipfsHash: '',
  });

  useEffect(() => {
    // Initialize with dummy data if no requests exist
    const storedRequests = getVerificationRequests();
    if (storedRequests.length === 0) {
      const dummyRequests = generateDummyVerificationRequests();
      dummyRequests.forEach(req => {
        addVerificationRequest(req);
      });
      setRequests(dummyRequests);
    } else {
      setRequests(storedRequests);
    }
  }, []);

  const handleVerify = (requestId) => {
    const updated = updateVerificationRequest(requestId, {
      status: 'Verified',
      verifiedBy: user?.name || 'Institution',
      verifiedDate: new Date().toISOString(),
    });
    setRequests(updated);

    // Add transaction
    addTransaction({
      id: `tx-${Date.now()}`,
      hash: `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}`,
      type: 'Verify',
      timestamp: new Date().toISOString(),
      status: 'Confirmed',
    });
  };

  const handleReject = (requestId) => {
    const updated = updateVerificationRequest(requestId, {
      status: 'Rejected',
      verifiedBy: user?.name || 'Institution',
      verifiedDate: new Date().toISOString(),
    });
    setRequests(updated);
  };

  const handleUploadRecord = () => {
    if (!newRecord.studentId || !newRecord.studentName || !newRecord.documentName) {
      return;
    }

    const newRequest = {
      id: `req-${Date.now()}`,
      ...newRecord,
      requestDate: new Date().toISOString(),
      status: 'Pending',
    };

    addVerificationRequest(newRequest);
    const updated = getVerificationRequests();
    setRequests(updated);

    // Reset form
    setNewRecord({
      studentId: '',
      studentName: '',
      documentName: '',
      documentType: 'Transcript',
      ipfsHash: '',
    });
    setOpenModal(false);
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const verifiedRequests = requests.filter(r => r.status === 'Verified');
  const totalRequests = requests.length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Welcome, {user?.name || 'Institution'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage student verification requests and upload new records
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
        >
          Upload New Record
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Requests
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {totalRequests}
                  </Typography>
                </Box>
                <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4" fontWeight={600} color="warning.main">
                    {pendingRequests.length}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Verified
                  </Typography>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {verifiedRequests.length}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Verification Requests
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Document Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Request Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No verification requests found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>{request.studentId}</TableCell>
                      <TableCell>{request.studentName}</TableCell>
                      <TableCell>{request.documentName}</TableCell>
                      <TableCell>{request.documentType}</TableCell>
                      <TableCell>
                        {new Date(request.requestDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.status}
                          color={
                            request.status === 'Verified' ? 'success' :
                            request.status === 'Rejected' ? 'error' : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {request.status === 'Pending' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleVerify(request.id)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReject(request.id)}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Upload New Record Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload New Record</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Student ID"
              value={newRecord.studentId}
              onChange={(e) => setNewRecord({ ...newRecord, studentId: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Student Name"
              value={newRecord.studentName}
              onChange={(e) => setNewRecord({ ...newRecord, studentName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Document Name"
              value={newRecord.documentName}
              onChange={(e) => setNewRecord({ ...newRecord, documentName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              select
              label="Document Type"
              value={newRecord.documentType}
              onChange={(e) => setNewRecord({ ...newRecord, documentType: e.target.value })}
              fullWidth
            >
              <MenuItem value="Transcript">Transcript</MenuItem>
              <MenuItem value="Certificate">Certificate</MenuItem>
              <MenuItem value="Degree">Degree</MenuItem>
            </TextField>
            <TextField
              label="IPFS Hash (Optional)"
              value={newRecord.ipfsHash}
              onChange={(e) => setNewRecord({ ...newRecord, ipfsHash: e.target.value })}
              fullWidth
              placeholder="Qm..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleUploadRecord} variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

