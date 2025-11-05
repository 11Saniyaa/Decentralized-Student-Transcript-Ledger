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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  RequestQuote as RequestIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { transcriptAPI, requestAPI } from '../utils/api';
import { getUser } from '../utils/storage';

export default function StudentDashboardNew() {
  const navigate = useNavigate();
  const user = getUser();
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const identifier = user?.identifier || '';

  useEffect(() => {
    fetchTranscripts();
  }, [identifier]);

  const fetchTranscripts = async () => {
    if (!identifier) {
      setError('Please login first');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Try to fetch by PRN first, then by wallet ID
      let response;
      if (identifier.startsWith('STU') || identifier.length <= 20) {
        // Likely a PRN
        response = await transcriptAPI.getByStudent(identifier.toUpperCase());
      } else {
        // Likely a wallet ID
        response = await transcriptAPI.getByWallet(identifier);
      }

      if (response.data.success) {
        setTranscripts(response.data.data || []);
      }
    } catch (error) {
      console.error('Fetch transcripts error:', error);
      setError(error.response?.data?.message || 'Failed to fetch transcripts');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTranscript = (transcriptId) => {
    navigate(`/transcript/${transcriptId}`);
  };

  const handleDownload = (ipfsUrl, filename) => {
    // Create download link
    const link = document.createElement('a');
    link.href = ipfsUrl;
    link.download = filename || 'transcript.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Also open in new tab
    setTimeout(() => {
      window.open(ipfsUrl, '_blank');
    }, 100);
  };

  const handleRequestTranscript = async () => {
    if (!requestMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setSubmittingRequest(true);
      const response = await requestAPI.create({
        studentPrn: identifier.toUpperCase(),
        message: requestMessage,
        requestType: 'Transcript Request',
      });

      if (response.data.success) {
        setRequestModalOpen(false);
        setRequestMessage('');
        alert('Request submitted successfully!');
      }
    } catch (error) {
      console.error('Request error:', error);
      alert(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            My Transcripts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage your academic transcripts
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTranscripts}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<RequestIcon />}
            onClick={() => setRequestModalOpen(true)}
          >
            Request Transcript
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {transcripts.length === 0 && !loading ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No transcripts found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You don't have any transcripts yet. Request a transcript to get started.
            </Typography>
            <Button
              variant="contained"
              startIcon={<RequestIcon />}
              onClick={() => setRequestModalOpen(true)}
            >
              Request Transcript
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Filename</TableCell>
                    <TableCell>Branch</TableCell>
                    <TableCell>Uploaded Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transcripts.map((transcript) => (
                    <TableRow key={transcript._id} hover>
                      <TableCell>{transcript.filename}</TableCell>
                      <TableCell>{transcript.branch || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(transcript.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transcript.status}
                          color={
                            transcript.status === 'Verified' ? 'success' :
                            transcript.status === 'Rejected' ? 'error' : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewTranscript(transcript._id)}
                            title="View"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleDownload(transcript.ipfsUrl, transcript.filename)}
                            title="Download"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Request Transcript Modal */}
      <Dialog open={requestModalOpen} onClose={() => setRequestModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Transcript</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message"
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="Please describe your transcript request..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRequestTranscript}
            variant="contained"
            disabled={submittingRequest}
          >
            {submittingRequest ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

