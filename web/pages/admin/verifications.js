import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Link,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { useRouter } from 'next/router';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Link as LinkIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { VERIFICATION_TYPES } from '../../../src/config/constants';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Verifications() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !['admin', 'verifier'].includes(user.role)) {
      router.push('/admin/login');
      return;
    }

    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/admin/verifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVerifications(response.data.data);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      setError('Error al cargar las verificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (approved) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/verifications/${selectedVerification.id}/${approved ? 'approve' : 'reject'}`,
        { note },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setDialogOpen(false);
      setSelectedVerification(null);
      setNote('');
      fetchVerifications();
    } catch (error) {
      console.error('Error updating verification:', error);
      setError('Error al actualizar la verificación');
    }
  };

  const getVerificationsByStatus = (status) => {
    return verifications.filter(v => v.status === status);
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

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(event, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Pendientes" />
          <Tab label="En Revisión" />
          <Tab label="Completadas" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {getVerificationsByStatus('pending').map((verification) => (
              <Grid item xs={12} md={6} lg={4} key={verification.id}>
                <VerificationCard
                  verification={verification}
                  onVerify={() => {
                    setSelectedVerification(verification);
                    setDialogOpen(true);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {getVerificationsByStatus('in_review').map((verification) => (
              <Grid item xs={12} md={6} lg={4} key={verification.id}>
                <VerificationCard
                  verification={verification}
                  onVerify={() => {
                    setSelectedVerification(verification);
                    setDialogOpen(true);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {getVerificationsByStatus('completed').map((verification) => (
              <Grid item xs={12} md={6} lg={4} key={verification.id}>
                <VerificationCard
                  verification={verification}
                  readOnly
                />
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Verificar Artista</DialogTitle>
        <DialogContent>
          {selectedVerification && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedVerification.user.firstName} {selectedVerification.user.lastName}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Tipo de Artista: {selectedVerification.user.artistType}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Tipo de Verificación: {VERIFICATION_TYPES[selectedVerification.type]}
              </Typography>

              <List>
                {selectedVerification.documents.map((doc, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {doc.type === 'link' ? <LinkIcon /> : <DescriptionIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.title}
                      secondary={
                        doc.type === 'link' ? (
                          <Link href={doc.url} target="_blank" rel="noopener noreferrer">
                            {doc.url}
                          </Link>
                        ) : doc.description
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <TextField
                fullWidth
                multiline
                rows={4}
                margin="normal"
                label="Notas de Verificación"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => handleVerify(false)}
            color="error"
            startIcon={<CancelIcon />}
          >
            Rechazar
          </Button>
          <Button
            onClick={() => handleVerify(true)}
            color="success"
            variant="contained"
            startIcon={<CheckCircleIcon />}
          >
            Aprobar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

function VerificationCard({ verification, onVerify, readOnly }) {
  return (
    <Card>
      {verification.documents.some(d => d.type === 'image') && (
        <CardMedia
          component="img"
          height="140"
          image={verification.documents.find(d => d.type === 'image').url}
          alt="Documento de verificación"
        />
      )}
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            {verification.user.firstName} {verification.user.lastName}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Tipo de Artista: {verification.user.artistType}
        </Typography>

        <Chip
          label={VERIFICATION_TYPES[verification.type]}
          color="primary"
          size="small"
          sx={{ mb: 2 }}
        />

        <List dense>
          {verification.documents.map((doc, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                {doc.type === 'link' ? <LinkIcon /> : <DescriptionIcon />}
              </ListItemIcon>
              <ListItemText
                primary={doc.title}
                secondary={
                  doc.type === 'link' ? (
                    <Link href={doc.url} target="_blank" rel="noopener noreferrer">
                      Ver documento
                    </Link>
                  ) : doc.description
                }
              />
            </ListItem>
          ))}
        </List>

        {verification.reviewNotes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Notas de Revisión:
            </Typography>
            <Typography variant="body2">
              {verification.reviewNotes}
            </Typography>
          </>
        )}

        {!readOnly && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onVerify}
            >
              Verificar
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
