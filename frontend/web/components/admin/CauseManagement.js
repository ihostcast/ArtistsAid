import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MonetizationOn as MonetizationOnIcon,
  Assignment as AssignmentIcon,
  ReceiptLong as ReceiptIcon,
} from '@mui/icons-material';
import { CAUSE_STATUS, CAUSE_CATEGORIES } from '../../../src/config/constants';

export default function CauseManagement({ causes, onVerify, onReject, onAssignFunds, onVerifyReceipt, userRole }) {
  const [selectedCause, setSelectedCause] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('verify'); // verify, assign, receipt
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [filter, setFilter] = useState('pending');

  const handleAction = async () => {
    switch (dialogType) {
      case 'verify':
        await onVerify(selectedCause.id, note);
        break;
      case 'reject':
        await onReject(selectedCause.id, note);
        break;
      case 'assign':
        await onAssignFunds(selectedCause.id, parseFloat(amount), note);
        break;
      case 'receipt':
        await onVerifyReceipt(selectedCause.id, note);
        break;
    }
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedCause(null);
    setNote('');
    setAmount('');
  };

  const filteredCauses = causes?.filter(cause => {
    switch (filter) {
      case 'pending':
        return cause.status === CAUSE_STATUS.PENDING_REVIEW;
      case 'verified':
        return cause.status === CAUSE_STATUS.APPROVED;
      case 'funded':
        return cause.status === CAUSE_STATUS.FUNDED;
      case 'completed':
        return cause.status === CAUSE_STATUS.COMPLETED;
      default:
        return true;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case CAUSE_STATUS.PENDING_REVIEW:
        return 'warning';
      case CAUSE_STATUS.APPROVED:
        return 'info';
      case CAUSE_STATUS.FUNDED:
        return 'success';
      case CAUSE_STATUS.COMPLETED:
        return 'default';
      case CAUSE_STATUS.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Gestión de Causas</Typography>
        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel>Filtrar por Estado</InputLabel>
          <Select
            value={filter}
            label="Filtrar por Estado"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="pending">Pendientes</MenuItem>
            <MenuItem value="verified">Verificadas</MenuItem>
            <MenuItem value="funded">Financiadas</MenuItem>
            <MenuItem value="completed">Completadas</MenuItem>
            <MenuItem value="all">Todas</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {filteredCauses?.map((cause) => (
          <Grid item xs={12} md={6} lg={4} key={cause.id}>
            <Card>
              {cause.evidence?.[0]?.type === 'image' && (
                <CardMedia
                  component="img"
                  height="140"
                  image={cause.evidence[0].url}
                  alt="Evidencia de la causa"
                />
              )}
              <CardContent>
                <Typography variant="h6" gutterBottom>{cause.title}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {cause.description}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={CAUSE_CATEGORIES[cause.category]}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={CAUSE_STATUS[cause.status]}
                    color={getStatusColor(cause.status)}
                    size="small"
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">
                    Monto Solicitado: ${cause.amountRequested.toLocaleString()}
                  </Typography>
                  {cause.amountRaised > 0 && (
                    <Typography variant="subtitle2">
                      Monto Asignado: ${cause.amountRaised.toLocaleString()}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  {userRole === 'verifier' && cause.status === CAUSE_STATUS.PENDING_REVIEW && (
                    <>
                      <Tooltip title="Aprobar">
                        <IconButton
                          color="success"
                          onClick={() => {
                            setSelectedCause(cause);
                            setDialogType('verify');
                            setDialogOpen(true);
                          }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rechazar">
                        <IconButton
                          color="error"
                          onClick={() => {
                            setSelectedCause(cause);
                            setDialogType('reject');
                            setDialogOpen(true);
                          }}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {userRole === 'financial' && cause.status === CAUSE_STATUS.APPROVED && (
                    <Tooltip title="Asignar Fondos">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setSelectedCause(cause);
                          setDialogType('assign');
                          setDialogOpen(true);
                        }}
                      >
                        <MonetizationOnIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {cause.status === CAUSE_STATUS.FUNDED && (
                    <Tooltip title="Verificar Recibos">
                      <IconButton
                        color="info"
                        onClick={() => {
                          setSelectedCause(cause);
                          setDialogType('receipt');
                          setDialogOpen(true);
                        }}
                      >
                        <ReceiptIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Ver Detalles">
                    <IconButton color="default">
                      <AssignmentIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'verify' && 'Verificar Causa'}
          {dialogType === 'reject' && 'Rechazar Causa'}
          {dialogType === 'assign' && 'Asignar Fondos'}
          {dialogType === 'receipt' && 'Verificar Recibos'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedCause && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Causa: {selectedCause.title}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Categoría: {CAUSE_CATEGORIES[selectedCause.category]}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Monto Solicitado: ${selectedCause.amountRequested.toLocaleString()}
                </Typography>
              </>
            )}
            {dialogType === 'assign' && (
              <TextField
                fullWidth
                type="number"
                label="Monto a Asignar"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                margin="normal"
              />
            )}
            <TextField
              fullWidth
              multiline
              rows={4}
              margin="normal"
              label="Notas"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleAction} color="primary" variant="contained">
            {dialogType === 'verify' && 'Aprobar'}
            {dialogType === 'reject' && 'Rechazar'}
            {dialogType === 'assign' && 'Asignar'}
            {dialogType === 'receipt' && 'Verificar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
