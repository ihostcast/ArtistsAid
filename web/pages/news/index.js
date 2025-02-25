import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Pagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import axios from 'axios';
import { NEWS_CATEGORIES } from '../../../src/config/constants';

export default function NewsPage() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, [page, category]);

  const fetchNews = async () => {
    try {
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...(category && { category })
      });

      const response = await axios.get(`/api/news?${params}`);
      setNews(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (newsItem) => {
    const url = `${window.location.origin}/news/${newsItem.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: newsItem.title,
        text: newsItem.content.substring(0, 100) + '...',
        url: url
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(url);
      // Aquí podrías mostrar un snackbar o notificación
    }
  };

  const handleLike = async (newsId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await axios.post(`/api/news/${newsId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Actualizar el estado local
      setNews(news.map(item => {
        if (item.id === newsId) {
          return {
            ...item,
            liked: !item.liked,
            likesCount: item.liked ? item.likesCount - 1 : item.likesCount + 1
          };
        }
        return item;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Noticias y Actualizaciones
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar noticias"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={category}
                label="Categoría"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {Object.entries(NEWS_CATEGORIES).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {news.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {item.imageUrl && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.imageUrl}
                    alt={item.title}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.content.substring(0, 150)}...
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={item.category}
                      size="small"
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleLike(item.id)}
                        color={item.liked ? 'error' : 'default'}
                      >
                        {item.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {item.likesCount}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                        <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">
                          {item.views}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleShare(item)}>
                        <ShareIcon />
                      </IconButton>
                      <Button
                        size="small"
                        onClick={() => router.push(`/news/${item.id}`)}
                      >
                        Leer más
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Box>
    </Container>
  );
}
