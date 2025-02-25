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
  Link,
} from '@mui/material';
import { ARTIST_TYPES } from '../../../src/config/constants';

export default function UserManagement({ users, onVerifyUser, onRejectUser }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState('pending');

  const handleVerify = async () => {
    await onVerifyUser(selectedUser.id, verificationNote);
    setDialogOpen(false);
    setSelectedUser(null);
    setVerificationNote('');
  };

  const handleReject = async () => {
    await onRejectUser(selectedUser.id, verificationNote);
    setDialogOpen(false);
    setSelectedUser(null);
    setVerificationNote('');
  };

  const filteredUsers = users?.filter(user => {
    switch (filter) {
      case 'pending':
        return !user.isVerified;
      case 'verified':
        return user.isVerified;
      case 'admin':
        return user.role === 'admin';
      default:
        return true;
    }
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Gestión de Usuarios</Typography>
        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel>Filtrar por</InputLabel>
          <Select
            value={filter}
            label="Filtrar por"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="pending">Pendientes de Verificación</MenuItem>
            <MenuItem value="verified">Artistas Verificados</MenuItem>
            <MenuItem value="admin">Administradores</MenuItem>
            <MenuItem value="all">Todos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Tipo de Artista</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Portafolio</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.artistType ? (
                    <Chip 
                      label={ARTIST_TYPES[user.artistType]} 
                      color="primary" 
                      size="small" 
                    />
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isVerified ? 'Verificado' : 'Pendiente'}
                    color={user.isVerified ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {user.portfolio && (
                    <Link href={user.portfolio} target="_blank" rel="noopener noreferrer">
                      Ver Portafolio
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  {!user.isVerified && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        setSelectedUser(user);
                        setDialogOpen(true);
                      }}
                    >
                      Verificar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Verificar Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Usuario: {selectedUser?.firstName} {selectedUser?.lastName}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              Tipo de Artista: {ARTIST_TYPES[selectedUser?.artistType]}
            </Typography>
            {selectedUser?.portfolio && (
              <Link href={selectedUser.portfolio} target="_blank" rel="noopener noreferrer">
                Ver Portafolio
              </Link>
            )}
            <TextField
              fullWidth
              multiline
              rows={4}
              margin="normal"
              label="Notas de Verificación"
              value={verificationNote}
              onChange={(e) => setVerificationNote(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleReject} color="error">
            Rechazar
          </Button>
          <Button onClick={handleVerify} color="primary" variant="contained">
            Aprobar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
