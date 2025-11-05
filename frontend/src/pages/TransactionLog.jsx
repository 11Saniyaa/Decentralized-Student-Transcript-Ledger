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
  TextField,
  InputAdornment,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  FileCopy as FileCopyIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { generateDummyTransactions } from '../data/dummyData';
import { getTransactions } from '../utils/storage';

export default function TransactionLog() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    // Initialize with dummy data if no transactions exist
    const storedTransactions = getTransactions();
    if (storedTransactions.length === 0) {
      const dummyTransactions = generateDummyTransactions();
      dummyTransactions.forEach(tx => {
        const { addTransaction } = require('../utils/storage');
        addTransaction(tx);
      });
      setTransactions(dummyTransactions);
      setFilteredTransactions(dummyTransactions);
    } else {
      setTransactions(storedTransactions);
      setFilteredTransactions(storedTransactions);
    }
  }, []);

  useEffect(() => {
    const filtered = transactions.filter(tx =>
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransactions(filtered);
    setPage(1);
  }, [searchTerm, transactions]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const paginatedTransactions = filteredTransactions.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Transaction Log
        </Typography>
        <TextField
          placeholder="Search transactions..."
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Total Transactions: {filteredTransactions.length}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction Hash</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Block Number</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {searchTerm ? 'No transactions match your search.' : 'No transactions found.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {tx.hash.substring(0, 16)}...
                          </Typography>
                          <Tooltip title="Copy Hash">
                            <IconButton size="small" onClick={() => copyToClipboard(tx.hash)}>
                              <FileCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.type}
                          color={tx.type === 'Verify' ? 'success' : 'primary'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={tx.status === 'Confirmed' ? <CheckCircleIcon /> : <PendingIcon />}
                          label={tx.status}
                          color={tx.status === 'Confirmed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(tx.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {tx.blockNumber?.toLocaleString() || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View on Explorer">
                          <IconButton size="small">
                            <FileCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredTransactions.length > rowsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(filteredTransactions.length / rowsPerPage)}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

