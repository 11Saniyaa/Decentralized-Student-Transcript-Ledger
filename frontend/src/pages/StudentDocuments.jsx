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
  Chip,
  IconButton,
  Tooltip,
  Link,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Link as LinkIcon,
  FileCopy as FileCopyIcon,
} from '@mui/icons-material';
import { getDocuments } from '../utils/storage';
import { getIpfsUrl } from '../lib/ipfs';

export default function StudentDocuments() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    setDocuments(getDocuments());
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        My Documents
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View and manage all your uploaded academic documents
      </Typography>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Document Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>IPFS Hash</TableCell>
                  <TableCell>Blockchain Hash</TableCell>
                  <TableCell>Verified By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No documents found. Upload your first transcript to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {doc.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell>
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={doc.status === 'Verified' ? <CheckCircleIcon /> : <PendingIcon />}
                          label={doc.status}
                          color={doc.status === 'Verified' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {doc.ipfsHash.substring(0, 12)}...
                          </Typography>
                          <Tooltip title="Copy IPFS Hash">
                            <IconButton size="small" onClick={() => copyToClipboard(doc.ipfsHash)}>
                              <FileCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View on IPFS">
                            <IconButton
                              size="small"
                              component={Link}
                              href={getIpfsUrl(doc.ipfsHash)}
                              target="_blank"
                            >
                              <LinkIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {doc.blockchainHash.substring(0, 12)}...
                          </Typography>
                          <Tooltip title="Copy Blockchain Hash">
                            <IconButton size="small" onClick={() => copyToClipboard(doc.blockchainHash)}>
                              <FileCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {doc.verifiedBy || '-'}
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

