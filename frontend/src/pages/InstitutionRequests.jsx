import React, { useState, useEffect } from 'react';
import {
  Box,
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
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { getVerificationRequests, updateVerificationRequest, addTransaction } from '../utils/storage';

export default function InstitutionRequests() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedRequests = getVerificationRequests();
    setRequests(storedRequests);
    setFilteredRequests(storedRequests);
  }, []);

  useEffect(() => {
    const filtered = requests.filter(req =>
      req.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.documentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchTerm, requests]);

  const handleVerify = (requestId) => {
    const updated = updateVerificationRequest(requestId, {
      status: 'Verified',
      verifiedDate: new Date().toISOString(),
    });
    setRequests(updated);
    setFilteredRequests(updated);

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
      verifiedDate: new Date().toISOString(),
    });
    setRequests(updated);
    setFilteredRequests(updated);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Verification Requests
        </Typography>
        <TextField
          placeholder="Search requests..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Document Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Request Date</TableCell>
                  <TableCell>IPFS Hash</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {searchTerm ? 'No requests match your search.' : 'No verification requests found.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>{request.studentId}</TableCell>
                      <TableCell>{request.studentName}</TableCell>
                      <TableCell>{request.documentName}</TableCell>
                      <TableCell>{request.documentType}</TableCell>
                      <TableCell>
                        {new Date(request.requestDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {request.ipfsHash ? `${request.ipfsHash.substring(0, 12)}...` : '-'}
                        </Typography>
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
                              title="Verify"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReject(request.id)}
                              title="Reject"
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
    </Box>
  );
}

