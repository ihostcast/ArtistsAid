import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import NewsCard from '../components/NewsCard';
import { NEWS_CATEGORIES } from '../../src/config/constants';

export default function NewsScreen() {
  const navigation = useNavigation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const fetchNews = async (pageNum = 1, shouldRefresh = false) => {
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 10,
        ...(category && { category }),
        ...(search && { search })
      });

      const response = await axios.get(`http://localhost:3000/api/news?${params}`);
      const { data, pagination } = response.data;

      if (shouldRefresh || pageNum === 1) {
        setNews(data);
      } else {
        setNews(prev => [...prev, ...data]);
      }

      setHasMore(pagination.currentPage < pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [category]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNews(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNews(page + 1);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchNews(1, true);
  };

  const renderFooter = () => {
    if (!loading || !hasMore) return null;

    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-4 shadow-sm">
        <TextInput
          className="bg-gray-100 rounded-lg px-4 py-2 mb-4"
          placeholder="Buscar noticias..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2"
        >
          <TouchableOpacity
            onPress={() => setCategory('')}
            className={`px-4 py-2 rounded-full mr-2 ${
              category === '' ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <Text
              className={`${
                category === '' ? 'text-white' : 'text-gray-700'
              }`}
            >
              Todas
            </Text>
          </TouchableOpacity>
          {Object.entries(NEWS_CATEGORIES).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setCategory(value)}
              className={`px-4 py-2 rounded-full mr-2 ${
                category === value ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <Text
                className={`${
                  category === value ? 'text-white' : 'text-gray-700'
                }`}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={news}
        renderItem={({ item }) => <NewsCard item={item} />}
        keyExtractor={item => item.id}
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-gray-500 text-lg">
              {loading ? 'Cargando...' : 'No hay noticias disponibles'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
