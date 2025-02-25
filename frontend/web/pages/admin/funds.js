import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function FundsManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [funds, setFunds] = useState({
    totalBalance: 0,
    availableBalance: 0,
    reservedBalance: 0,
    disbursedBalance: 0,
    monthlyStats: {},
    categoryAllocation: {},
    transactions: []
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !['admin', 'financial'].includes(user.role)) {
      router.push('/admin/login');
      return;
    }

    fetchFundsData();
  }, []);

  const fetchFundsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/admin/funds', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFunds(response.data.data);
    } catch (error) {
      console.error('Error fetching funds data:', error);
      setError('Error al cargar los datos de fondos');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/admin/funds/transfer',
        {
          amount: parseFloat(transferAmount),
          note: transferNote
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setDialogOpen(false);
      setTransferAmount('');
      setTransferNote('');
      fetchFundsData();
    } catch (error) {
      console.error('Error transferring funds:', error);
      setError('Error al transferir fondos');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Balance Cards */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Balance de Fondos
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Balance Total
                    </Typography>
                    <Typography variant="h4">
                      ${funds.totalBalance.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Disponible
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      ${funds.availableBalance.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Reservado
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      ${funds.reservedBalance.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Desembolsado
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      ${funds.disbursedBalance.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Monthly Stats Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estadísticas Mensuales
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(funds.monthlyStats).map(([month, stats]) => ({
                    month,
                    ingresos: stats.income,
                    egresos: stats.expenses
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ingresos" fill="#4caf50" />
                  <Bar dataKey="egresos" fill="#f44336" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Transacciones Recientes
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setDialogOpen(true)}
              >
                Nueva Transferencia
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell align="right">Monto</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {funds.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell align="right">
                        <Typography
                          color={transaction.type === 'ingreso' ? 'success.main' : 'error.main'}
                        >
                          ${transaction.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>{transaction.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Transfer Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Nueva Transferencia</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Monto"
            type="number"
            fullWidth
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Nota"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={transferNote}
            onChange={(e) => setTransferNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleTransfer} variant="contained" color="primary">
            Transferir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
