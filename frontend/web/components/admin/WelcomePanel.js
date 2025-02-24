import { Box, Typography, Paper, Grid } from '@mui/material';

export default function WelcomePanel({ user, stats }) {
  const getWelcomeMessage = () => {
    switch (user.role) {
      case 'admin':
        return `Bienvenido, ${user.firstName}. Tienes ${stats.pendingTasks.length} tareas pendientes.`;
      case 'financial':
        return `Bienvenido, ${user.firstName}. Hay ${stats.pendingCauses || 0} causas esperando asignación de fondos.`;
      case 'verifier':
        return `Bienvenido, ${user.firstName}. Hay ${stats.pendingVerifications} verificaciones pendientes.`;
      default:
        return `Bienvenido, ${user.firstName}`;
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            {getWelcomeMessage()}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box>
            <Typography variant="subtitle1">Fondos Disponibles</Typography>
            <Typography variant="h4">
              ${stats.fundBalance?.available.toLocaleString() || 0}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box>
            <Typography variant="subtitle1">Causas Activas</Typography>
            <Typography variant="h4">
              {stats.totalCauses || 0}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box>
            <Typography variant="subtitle1">Donaciones Recientes</Typography>
            <Typography variant="h4">
              {stats.recentDonations || 0}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
