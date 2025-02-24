import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Analytics({ stats }) {
  const [timeRange, setTimeRange] = useState('month');

  // Formatear datos para los gráficos
  const fundData = [
    { name: 'Disponible', value: stats.fundBalance.available },
    { name: 'Reservado', value: stats.fundBalance.reserved },
    { name: 'Desembolsado', value: stats.fundBalance.disbursed },
  ];

  const categoryData = Object.entries(stats.categoryStats || {}).map(([category, count]) => ({
    name: category,
    count,
  }));

  const donationData = stats.donationStats || [];

  return (
    <Grid container spacing={3}>
      {/* Gráfico de Balance de Fondos */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: '400px' }}>
          <Typography variant="h6" gutterBottom>
            Distribución de Fondos
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fundData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {fundData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Gráfico de Causas por Categoría */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: '400px' }}>
          <Typography variant="h6" gutterBottom>
            Causas por Categoría
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Gráfico de Donaciones */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Donaciones</Typography>
            <FormControl size="small" sx={{ width: 200 }}>
              <InputLabel>Periodo</InputLabel>
              <Select
                value={timeRange}
                label="Periodo"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="week">Última Semana</MenuItem>
                <MenuItem value="month">Último Mes</MenuItem>
                <MenuItem value="year">Último Año</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={donationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#82ca9d" name="Monto" />
              <Bar dataKey="count" fill="#8884d8" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Tabla de Transacciones */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Últimas Transacciones
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Donante</TableCell>
                  <TableCell>Causa</TableCell>
                  <TableCell align="right">Monto</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recentTransactions?.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.donor}</TableCell>
                    <TableCell>{transaction.cause}</TableCell>
                    <TableCell align="right">
                      ${transaction.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* Indicador de Capacidad */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Capacidad del Sistema
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle1">Fondos Disponibles</Typography>
                <Typography variant="h4" color="success.main">
                  ${stats.fundBalance.available.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle1">Solicitudes Pendientes</Typography>
                <Typography variant="h4" color="warning.main">
                  ${(stats.pendingRequests || 0).toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}
