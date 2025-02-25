import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  Receipt as ReceiptIcon,
  ExitToApp as LogoutIcon,
  AccountBalance as AccountBalanceIcon,
  VerifiedUser as VerifiedUserIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import axios from 'axios';

// Importar componentes
import WelcomePanel from '../../components/admin/WelcomePanel';
import UserManagement from '../../components/admin/UserManagement';
import CauseManagement from '../../components/admin/CauseManagement';
import Analytics from '../../components/admin/Analytics';

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

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCauses: 0,
    totalDonations: 0,
    totalReceipts: 0,
    pendingVerifications: 0,
    fundBalance: {
      total: 0,
      available: 0,
      reserved: 0,
      disbursed: 0
    },
    recentActivity: [],
    pendingTasks: [],
    categoryStats: {},
    artistTypeStats: {},
    users: [],
    causes: [],
    recentTransactions: []
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || userData.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    setUser(userData);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId, note) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/users/${userId}/verify`,
        { note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStats();
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const handleRejectUser = async (userId, note) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/users/${userId}/reject`,
        { note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStats();
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const handleVerifyCause = async (causeId, note) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/causes/${causeId}/verify`,
        { note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStats();
    } catch (error) {
      console.error('Error verifying cause:', error);
    }
  };

  const handleRejectCause = async (causeId, note) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/causes/${causeId}/reject`,
        { note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStats();
    } catch (error) {
      console.error('Error rejecting cause:', error);
    }
  };

  const handleAssignFunds = async (causeId, amount, note) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/causes/${causeId}/assign-funds`,
        { amount, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStats();
    } catch (error) {
      console.error('Error assigning funds:', error);
    }
  };

  const handleVerifyReceipt = async (causeId, note) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/causes/${causeId}/verify-receipt`,
        { note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStats();
    } catch (error) {
      console.error('Error verifying receipt:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Usuarios', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Causas', icon: <CampaignIcon />, path: '/admin/causes' },
    { text: 'Recibos', icon: <ReceiptIcon />, path: '/admin/receipts' },
    { text: 'Verificaciones', icon: <VerifiedUserIcon />, path: '/admin/verifications' },
    { text: 'Fondos', icon: <AccountBalanceIcon />, path: '/admin/funds' }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Panel de Administración
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} />
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List sx={{ width: 250 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                router.push(item.path);
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
        }}
      >
        <Container maxWidth="xl">
          <WelcomePanel user={user} stats={stats} />

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(event, newValue) => setTabValue(newValue)}
              aria-label="dashboard tabs"
            >
              <Tab icon={<AnalyticsIcon />} label="Analíticas" />
              <Tab icon={<PeopleIcon />} label="Usuarios" />
              <Tab icon={<CampaignIcon />} label="Causas" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Analytics stats={stats} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <UserManagement
              users={stats.users}
              onVerifyUser={handleVerifyUser}
              onRejectUser={handleRejectUser}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <CauseManagement
              causes={stats.causes}
              onVerify={handleVerifyCause}
              onReject={handleRejectCause}
              onAssignFunds={handleAssignFunds}
              onVerifyReceipt={handleVerifyReceipt}
              userRole={user?.role}
            />
          </TabPanel>
        </Container>
      </Box>
    </Box>
  );
}
