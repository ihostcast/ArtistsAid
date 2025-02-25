import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  IconButton,
  Button,
  Divider,
  Avatar,
  Grid,
  Card,
  CardContent,
  Skeleton,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  LinkedIn as LinkedInIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import axios from 'axios';
import Image from 'next/image';

export default function NewsDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState([]);

  useEffect(() => {
    if (id) {
      fetchNewsDetail();
    }
  }, [id]);

  const fetchNewsDetail = async () => {
    try {
      const [newsResponse, relatedResponse] = await Promise.all([
        axios.get(`/api/news/${id}`),
        axios.get('/api/news', {
          params: {
            limit: 3,
            exclude: id
          }
        })
      ]);

      setNews(newsResponse.data.data);
      setRelatedNews(relatedResponse.data.data);
    } catch (error) {
      console.error('Error fetching news detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.post(`/api/news/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNews({
        ...news,
        liked: response.data.data.liked,
        likesCount: response.data.data.likesCount
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = news.title;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    if (platform === 'native' && navigator.share) {
      navigator.share({
        title: news.title,
        text: news.content.substring(0, 100) + '...',
        url: url
      });
    } else {
      window.open(shareUrls[platform], '_blank');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={30} sx={{ mb: 4 }} />
        <Skeleton variant="rectangular" height={200} />
      </Container>
    );
  }

  if (!news) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5">Noticia no encontrada</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {news.imageUrl && (
        <Box sx={{ position: 'relative', height: 400, mb: 4 }}>
          <Image
            src={news.imageUrl}
            alt={news.title}
            layout="fill"
            objectFit="cover"
            priority
          />
        </Box>
      )}

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {news.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar src={news.author?.imageUrl} sx={{ mr: 2 }}>
            {news.author?.firstName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1">
              {news.author?.firstName} {news.author?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(news.createdAt).toLocaleDateString()} · {news.category}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <IconButton onClick={handleLike} color={news.liked ? 'error' : 'default'}>
              {news.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography>{news.likesCount}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <VisibilityIcon sx={{ mr: 1 }} />
            <Typography>{news.views}</Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={() => handleShare('facebook')} color="primary">
            <FacebookIcon />
          </IconButton>
          <IconButton onClick={() => handleShare('twitter')} color="primary">
            <TwitterIcon />
          </IconButton>
          <IconButton onClick={() => handleShare('whatsapp')} color="primary">
            <WhatsAppIcon />
          </IconButton>
          <IconButton onClick={() => handleShare('linkedin')} color="primary">
            <LinkedInIcon />
          </IconButton>
          <IconButton onClick={() => handleShare('native')}>
            <ShareIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="body1" sx={{ mb: 4, whiteSpace: 'pre-wrap' }}>
          {news.content}
        </Typography>

        {relatedNews.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Noticias Relacionadas
            </Typography>
            <Grid container spacing={3}>
              {relatedNews.map((item) => (
                <Grid item xs={12} sm={4} key={item.id}>
                  <Card>
                    {item.imageUrl && (
                      <Box sx={{ position: 'relative', height: 200 }}>
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          layout="fill"
                          objectFit="cover"
                        />
                      </Box>
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.content.substring(0, 100)}...
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => router.push(`/news/${item.id}`)}
                      >
                        Leer más
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Paper>
    </Container>
  );
}
