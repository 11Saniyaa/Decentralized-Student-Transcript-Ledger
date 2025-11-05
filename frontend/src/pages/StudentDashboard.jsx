import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { generateDummyDocuments } from '../data/dummyData';
import { getUser, getDocuments, addDocument } from '../utils/storage';
import { uploadFile } from '../lib/ipfs';

export default function StudentDashboard() {
  const user = getUser();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    // Initialize with dummy data if no documents exist
    const storedDocs = getDocuments();
    if (storedDocs.length === 0 && user?.id) {
      const dummyDocs = generateDummyDocuments(user.id);
      dummyDocs.forEach(doc => addDocument(doc));
      setDocuments(dummyDocs);
    } else {
      setDocuments(storedDocs);
    }
  }, [user]);

  const handleUpload = async () => {
    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      // Create a dummy file for simulation
      const dummyFile = new File(['dummy transcript content'], 'transcript.pdf', { type: 'application/pdf' });
      
      // Upload to IPFS
      const ipfsHash = await uploadFile(dummyFile);
      
      // Generate blockchain hash (simulated)
      const blockchainHash = `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}`;
      
      // Create document entry
      const newDocument = {
        id: `doc-${Date.now()}`,
        studentId: user?.id || 'unknown',
        name: `Academic Transcript ${new Date().getFullYear()}`,
        type: 'Transcript',
        uploadDate: new Date().toISOString(),
        ipfsHash,
        blockchainHash,
        status: 'Pending',
        verifiedBy: null,
        verifiedDate: null,
      };

      addDocument(newDocument);
      setDocuments(prev => [...prev, newDocument]);
      setUploadSuccess(true);
      
      // Add transaction
      const { addTransaction } = require('../utils/storage');
      addTransaction({
        id: `tx-${Date.now()}`,
        hash: blockchainHash,
        type: 'Upload',
        timestamp: new Date().toISOString(),
        status: 'Confirmed',
      });

      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const verifiedCount = documents.filter(d => d.status === 'Verified').length;
  const pendingCount = documents.filter(d => d.status === 'Pending').length;
  const totalCount = documents.length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Welcome, {user?.name || 'Student'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your academic transcripts and track verification status
      </Typography>

      {uploadSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Document uploaded successfully! IPFS hash generated.
        </Alert>
      )}

      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uploadError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Documents
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {totalCount}
                  </Typography>
                </Box>
                <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Verified
                  </Typography>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {verifiedCount}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4" fontWeight={600} color="warning.main">
                    {pendingCount}
                  </Typography>
                </Box>
                <PendingIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Verification Rate
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upload Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Upload Transcript
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload your academic transcript to the blockchain. The document will be stored on IPFS and a hash will be recorded on the blockchain.
              </Typography>
              {uploading && <LinearProgress sx={{ mb: 2 }} />}
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={handleUpload}
                disabled={uploading}
                size="large"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Documents */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Recent Documents
              </Typography>
              {documents.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  No documents uploaded yet. Upload your first transcript to get started.
                </Typography>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {documents.slice(0, 3).map((doc) => (
                    <Box
                      key={doc.id}
                      sx={{
                        p: 2,
                        mb: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {doc.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={doc.status}
                          color={doc.status === 'Verified' ? 'success' : 'warning'}
                          size="small"
                        />
                        <Chip
                          icon={<LinkIcon />}
                          label="IPFS"
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

