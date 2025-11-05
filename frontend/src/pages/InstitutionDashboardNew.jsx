import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { studentAPI, transcriptAPI, requestAPI } from '../utils/api';
import { getUser } from '../utils/storage';

export default function InstitutionDashboardNew() {
  const navigate = useNavigate();
  const user = getUser();
  const [tabValue, setTabValue] = useState(0);
  
  // Create Student Modal
  const [createStudentOpen, setCreateStudentOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', prn: '', walletId: '', branch: '' });
  const [creatingStudent, setCreatingStudent] = useState(false);

  // Create Transcript Modal
  const [createTranscriptOpen, setCreateTranscriptOpen] = useState(false);
  const [transcriptForm, setTranscriptForm] = useState({
    prn: '',
    studentName: '',
    branch: '',
    walletId: '',
  });
  const [transcriptFile, setTranscriptFile] = useState(null);
  const [uploadingTranscript, setUploadingTranscript] = useState(false);

  // Data
  const [transcripts, setTranscripts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all data in parallel
      const [transcriptsRes, requestsRes, studentsRes] = await Promise.allSettled([
        transcriptAPI.getAll(),
        requestAPI.getAll(),
        studentAPI.getAll(),
      ]);

      // Handle transcripts
      if (transcriptsRes.status === 'fulfilled' && transcriptsRes.value.data.success) {
        setTranscripts(transcriptsRes.value.data.data || []);
        console.log('✅ Transcripts loaded:', transcriptsRes.value.data.data?.length || 0);
      } else if (transcriptsRes.status === 'rejected') {
        console.error('Failed to fetch transcripts:', transcriptsRes.reason);
        setTranscripts([]);
      }

      // Handle requests
      if (requestsRes.status === 'fulfilled' && requestsRes.value.data.success) {
        setRequests(requestsRes.value.data.data || []);
      } else if (requestsRes.status === 'rejected') {
        console.error('Failed to fetch requests:', requestsRes.reason);
        setRequests([]);
      }

      // Handle students
      if (studentsRes.status === 'fulfilled' && studentsRes.value.data.success) {
        setStudents(studentsRes.value.data.data || []);
      } else if (studentsRes.status === 'rejected') {
        console.error('Failed to fetch students:', studentsRes.reason);
        setStudents([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.response?.data?.message || 'Failed to load data. Please check if backend is running.');
      // Set empty arrays so UI still renders
      setTranscripts([]);
      setRequests([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async () => {
    if (!newStudent.name || !newStudent.prn || !newStudent.walletId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setCreatingStudent(true);
      const response = await studentAPI.create(newStudent);
      
      if (response.data.success) {
        setCreateStudentOpen(false);
        setNewStudent({ name: '', prn: '', walletId: '', branch: '' });
        alert('Student created successfully!');
        fetchData();
      }
    } catch (error) {
      console.error('Create student error:', error);
      alert(error.response?.data?.message || 'Failed to create student');
    } finally {
      setCreatingStudent(false);
    }
  };

  const handleCreateTranscript = async () => {
    if (!transcriptForm.prn || !transcriptForm.studentName || !transcriptForm.walletId) {
      alert('Please fill in PRN, Student Name, and Wallet ID');
      return;
    }

    if (!transcriptFile) {
      alert('Please select a PDF file to upload');
      return;
    }

    // Validate file type
    if (transcriptFile.type !== 'application/pdf' && !transcriptFile.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a PDF file');
      return;
    }

    try {
      setUploadingTranscript(true);
      const formData = new FormData();
      formData.append('file', transcriptFile);
      formData.append('prn', transcriptForm.prn.toUpperCase());
      formData.append('studentName', transcriptForm.studentName);
      formData.append('branch', transcriptForm.branch || '');
      formData.append('walletId', transcriptForm.walletId);

      console.log('Uploading transcript:', {
        prn: transcriptForm.prn,
        studentName: transcriptForm.studentName,
        filename: transcriptFile.name,
        fileSize: transcriptFile.size,
      });

      const response = await transcriptAPI.upload(formData);
      
      if (response.data.success) {
        setCreateTranscriptOpen(false);
        setTranscriptForm({ prn: '', studentName: '', branch: '', walletId: '' });
        setTranscriptFile(null);
        
        // Show success message with blockchain info if available
        let successMsg = '✅ Transcript uploaded successfully!';
        if (response.data.data?.blockchainRecorded) {
          successMsg += `\n\n🔗 Blockchain: Transaction recorded`;
          successMsg += `\n📝 TX Hash: ${response.data.data.transactionHash?.substring(0, 20)}...`;
        }
        alert(successMsg);
        
        // Refresh data to show new transcript
        setTimeout(() => {
          fetchData();
        }, 500); // Small delay to ensure backend has saved
      } else {
        alert(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload transcript error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to upload transcript. Please check your connection and try again.';

      if (error.response?.data?.duplicate) {
        // Handle duplicate file upload
        alert(`⚠️ ${errorMsg}\n\nThis file has already been uploaded. If you need to upload it again, please use a different file or modify the existing transcript.`);
      } else if (error.response?.data?.studentNotFound) {
        alert('⚠️ Student not found. The system will auto-create the student. Please try again.');
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        alert('❌ Cannot connect to server. Please ensure the backend server is running on port 5000.');
      } else {
        alert(`❌ ${errorMsg}`);
      }
    } finally {
      setUploadingTranscript(false);
    }
  };

  const handleVerifyTranscript = async (transcriptId) => {
    try {
      const response = await transcriptAPI.verify(transcriptId, {
        verifier: user?.identifier || 'Institution',
      });

      if (response.data.success) {
        alert('Transcript verified successfully!');
        fetchData();
      }
    } catch (error) {
      console.error('Verify error:', error);
      alert(error.response?.data?.message || 'Failed to verify transcript');
    }
  };

  const handleProcessRequest = async (requestId, status) => {
    try {
      const response = await requestAPI.updateStatus(requestId, {
        status,
        processedBy: user?.identifier || 'Institution',
      });

      if (response.data.success) {
        alert(`✅ Request ${status.toLowerCase()} successfully!`);
        fetchData(); // Refresh to show updated status
      }
    } catch (error) {
      console.error('Process request error:', error);
      alert(error.response?.data?.message || 'Failed to process request');
    }
  };

  const searchStudent = async (prn) => {
    try {
      const response = await studentAPI.getByPRN(prn.toUpperCase());
      if (response.data.success) {
        setStudents([response.data.data]);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Student not found');
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
            Institution Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage students, transcripts, and verification requests
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCreateStudentOpen(true)}
          >
            Create Student
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setCreateTranscriptOpen(true)}
          >
            Create Transcript
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
            Make sure the backend server is running on port 5000
          </Typography>
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Transcripts" />
          <Tab label="Requests" />
          <Tab label="Search Student" />
        </Tabs>
      </Paper>

      {/* Transcripts Tab */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                All Transcripts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: {transcripts.length}
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Student Name</strong></TableCell>
                    <TableCell><strong>PRN</strong></TableCell>
                    <TableCell><strong>Branch</strong></TableCell>
                    <TableCell><strong>Filename</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Uploaded</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transcripts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary" variant="body1" sx={{ mb: 1 }}>
                          No transcripts found
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Click "Create Transcript" to upload a new transcript
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transcripts.map((transcript) => (
                      <TableRow key={transcript._id} hover>
                        <TableCell>{transcript.studentName}</TableCell>
                        <TableCell>{transcript.studentPrn}</TableCell>
                        <TableCell>{transcript.branch || 'N/A'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                              {transcript.filename}
                            </Typography>
                            {transcript.blockchainRecorded && (
                              <Tooltip title="Recorded on blockchain">
                                <Chip
                                  label="On-Chain"
                                  color="success"
                                  size="small"
                                  sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transcript.status}
                            color={transcript.status === 'Verified' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(transcript.uploadedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/transcript/${transcript._id}`)}
                              title="View Transcript"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            {transcript.blockchainRecorded && transcript.transactionHash && (
                              <Tooltip title={`Transaction Hash: ${transcript.transactionHash}`}>
                                <Chip
                                  label="🔗"
                                  size="small"
                                  sx={{ fontSize: '0.7rem', cursor: 'help' }}
                                />
                              </Tooltip>
                            )}
                            {transcript.status !== 'Verified' && (
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleVerifyTranscript(transcript._id)}
                                title="Verify"
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Requests Tab */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Verification Requests
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student PRN</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No requests found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request._id} hover>
                        <TableCell>{request.studentPrn}</TableCell>
                        <TableCell>{request.message || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={request.status}
                            color={
                              request.status === 'Processed' ? 'success' :
                              request.status === 'Rejected' ? 'error' : 'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {request.status === 'Pending' && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleProcessRequest(request._id, 'Processed')}
                                title="Process"
                              >
                                <CheckCircleIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleProcessRequest(request._id, 'Rejected')}
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
      )}

      {/* Search Student Tab */}
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Search Student
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="Enter PRN"
                placeholder="STU2024001"
                variant="outlined"
                size="small"
                sx={{ flex: 1 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    searchStudent(e.target.value);
                  }
                }}
              />
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={() => {
                  const input = document.querySelector('input[placeholder="STU2024001"]');
                  if (input) searchStudent(input.value);
                }}
              >
                Search
              </Button>
            </Box>
            {students.length > 0 && (
              <Box>
                {students.map((student) => (
                  <Card key={student._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6">{student.name}</Typography>
                      <Typography variant="body2">PRN: {student.prn}</Typography>
                      <Typography variant="body2">Wallet: {student.walletId}</Typography>
                      <Typography variant="body2">Branch: {student.branch || 'N/A'}</Typography>
                      {student.transcripts && student.transcripts.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2">Transcripts:</Typography>
                          {student.transcripts.map((t) => (
                            <Chip key={t._id} label={t.filename} size="small" sx={{ mr: 1, mt: 1 }} />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Student Modal */}
      <Dialog open={createStudentOpen} onClose={() => setCreateStudentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Student</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Student Name"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="PRN (Enrollment Number)"
              value={newStudent.prn}
              onChange={(e) => setNewStudent({ ...newStudent, prn: e.target.value.toUpperCase() })}
              fullWidth
              required
              placeholder="STU2024001"
            />
            <TextField
              label="Wallet ID"
              value={newStudent.walletId}
              onChange={(e) => setNewStudent({ ...newStudent, walletId: e.target.value })}
              fullWidth
              required
              placeholder="0x..."
            />
            <TextField
              label="Branch (Optional)"
              value={newStudent.branch}
              onChange={(e) => setNewStudent({ ...newStudent, branch: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateStudentOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateStudent}
            variant="contained"
            disabled={creatingStudent}
          >
            {creatingStudent ? 'Creating...' : 'Create Student'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Transcript Modal */}
      <Dialog open={createTranscriptOpen} onClose={() => setCreateTranscriptOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Transcript</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Student PRN"
              value={transcriptForm.prn}
              onChange={(e) => setTranscriptForm({ ...transcriptForm, prn: e.target.value.toUpperCase() })}
              fullWidth
              required
              placeholder="STU2024001"
            />
            <TextField
              label="Student Name"
              value={transcriptForm.studentName}
              onChange={(e) => setTranscriptForm({ ...transcriptForm, studentName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Branch"
              value={transcriptForm.branch}
              onChange={(e) => setTranscriptForm({ ...transcriptForm, branch: e.target.value })}
              fullWidth
            />
            <TextField
              label="Wallet ID"
              value={transcriptForm.walletId}
              onChange={(e) => setTranscriptForm({ ...transcriptForm, walletId: e.target.value })}
              fullWidth
              required
              placeholder="0x..."
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{ mt: 2 }}
              fullWidth
            >
              {transcriptFile ? `📄 ${transcriptFile.name} (${(transcriptFile.size / 1024).toFixed(2)} KB)` : 'Select PDF File'}
              <input
                type="file"
                hidden
                accept="application/pdf,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      alert('File size must be less than 10MB');
                      e.target.value = '';
                      return;
                    }
                    setTranscriptFile(file);
                  }
                }}
              />
            </Button>
            {transcriptFile && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                File selected: {transcriptFile.name} ({(transcriptFile.size / 1024).toFixed(2)} KB)
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTranscriptOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTranscript}
            variant="contained"
            disabled={uploadingTranscript}
          >
            {uploadingTranscript ? 'Uploading...' : 'Upload Transcript'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

