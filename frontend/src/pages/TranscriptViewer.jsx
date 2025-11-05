import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  OpenInNew as OpenInNewIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { transcriptAPI } from '../utils/api';

export default function TranscriptViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('iframe'); // 'iframe', 'object', 'embed'
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    fetchTranscript();
  }, [id]);

  const fetchTranscript = async () => {
    try {
      setLoading(true);
      const response = await transcriptAPI.getById(id);
      
      if (response.data.success) {
        setTranscript(response.data.data);
      }
    } catch (error) {
      console.error('Fetch transcript error:', error);
      setError(error.response?.data?.message || 'Failed to load transcript');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!transcript?.ipfsUrl) return;

    try {
      // Try to fetch and download the file
      const response = await fetch(transcript.ipfsUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = transcript.filename || 'transcript.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      window.open(transcript.ipfsUrl, '_blank');
    }
  };

  const handleOpenInNewTab = () => {
    if (transcript?.ipfsUrl) {
      window.open(transcript.ipfsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getIpfsGatewayUrl = (gateway = 'pinata') => {
    if (!transcript?.ipfsHash) return '';
    
    const gateways = {
      pinata: `https://gateway.pinata.cloud/ipfs/${transcript.ipfsHash}`,
      ipfs: `https://ipfs.io/ipfs/${transcript.ipfsHash}`,
      cloudflare: `https://cloudflare-ipfs.com/ipfs/${transcript.ipfsHash}`,
    };
    
    return gateways[gateway] || transcript.ipfsUrl;
  };

  const handleRetryLoad = () => {
    setPdfError(false);
    setViewMode('iframe');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !transcript) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Transcript not found'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            {transcript.filename}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip
              label={transcript.status}
              color={transcript.status === 'Verified' ? 'success' : 'warning'}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              Student: {transcript.studentName} ({transcript.studentPrn})
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Tooltip title="Open in new tab">
            <IconButton
              color="primary"
              onClick={handleOpenInNewTab}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Download
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {/* Gateway Selector Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
            <Tabs 
              value={viewMode} 
              onChange={(e, v) => {
                setViewMode(v);
                setPdfError(false);
              }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Embedded View" value="iframe" icon={<PdfIcon />} iconPosition="start" />
              <Tab label="Object View" value="object" icon={<PdfIcon />} iconPosition="start" />
              <Tab label="Direct Link" value="link" icon={<OpenInNewIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          <Box
            sx={{
              width: '100%',
              height: '80vh',
              minHeight: '600px',
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden',
              bgcolor: 'grey.100',
            }}
          >
            {viewMode === 'iframe' && (
              <iframe
                key={`iframe-${transcript.ipfsHash}`}
                src={`${transcript.ipfsUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title={transcript.filename}
                allow="fullscreen"
                onError={() => {
                  setPdfError(true);
                  console.warn('Iframe failed, trying alternative gateway...');
                }}
                onLoad={() => setPdfError(false)}
              />
            )}

            {viewMode === 'object' && (
              <object
                key={`object-${transcript.ipfsHash}`}
                data={transcript.ipfsUrl}
                type="application/pdf"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                aria-label={transcript.filename}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    p: 4,
                  }}
                >
                  <PdfIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    PDF cannot be displayed in browser
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Please use the download or open options below
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                  >
                    Download PDF
                  </Button>
                </Box>
              </object>
            )}

            {viewMode === 'link' && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  p: 4,
                  gap: 3,
                }}
              >
                <PdfIcon sx={{ fontSize: 80, color: 'primary.main' }} />
                <Typography variant="h5" gutterBottom>
                  {transcript.filename}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Choose how you want to access the PDF:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<OpenInNewIcon />}
                    onClick={() => window.open(transcript.ipfsUrl, '_blank')}
                  >
                    Open in New Tab
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                  >
                    Download File
                  </Button>
                </Box>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Alternative Gateways:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(getIpfsGatewayUrl('pinata'), '_blank')}
                    >
                      Pinata Gateway
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(getIpfsGatewayUrl('ipfs'), '_blank')}
                    >
                      IPFS.io Gateway
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(getIpfsGatewayUrl('cloudflare'), '_blank')}
                    >
                      Cloudflare Gateway
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Error overlay if PDF fails to load */}
            {pdfError && viewMode === 'iframe' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(255,255,255,0.95)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20,
                  p: 3,
                }}
              >
                <Alert severity="warning" sx={{ mb: 2, maxWidth: 500 }}>
                  PDF failed to load in embedded viewer. Try alternative options below.
                </Alert>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={handleRetryLoad}
                  >
                    Retry
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<OpenInNewIcon />}
                    onClick={handleOpenInNewTab}
                  >
                    Open in New Tab
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                  >
                    Download
                  </Button>
                </Box>
              </Box>
            )}

            {/* Quick action buttons overlay */}
            {!pdfError && viewMode !== 'link' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  display: 'flex',
                  gap: 1,
                  zIndex: 10,
                }}
              >
                <Tooltip title="Open in new tab">
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                    }}
                    onClick={handleOpenInNewTab}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download PDF">
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                    }}
                    onClick={handleDownload}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          Transcript Details & Access Links
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mt: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">IPFS Hash (CID):</Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace', 
                wordBreak: 'break-all',
                bgcolor: 'grey.50',
                p: 1,
                borderRadius: 1,
                mt: 0.5,
              }}
            >
              {transcript.ipfsHash}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Uploaded:</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {new Date(transcript.uploadedAt).toLocaleString()}
            </Typography>
          </Box>
          {transcript.verifiedAt && (
            <Box>
              <Typography variant="caption" color="text.secondary">Verified By:</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{transcript.verifiedBy}</Typography>
            </Box>
          )}
          {transcript.verifiedAt && (
            <Box>
              <Typography variant="caption" color="text.secondary">Verified At:</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {new Date(transcript.verifiedAt).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Quick Access Links */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Quick Access Links
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => window.open(transcript.ipfsUrl, '_blank')}
            >
              Pinata Gateway
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => window.open(`https://ipfs.io/ipfs/${transcript.ipfsHash}`, '_blank')}
            >
              IPFS.io Gateway
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => window.open(`https://cloudflare-ipfs.com/ipfs/${transcript.ipfsHash}`, '_blank')}
            >
              Cloudflare Gateway
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download PDF
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

