import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { COMMON_TAGS } from '../../src/config/constants';

export default function BlogScreen() {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [search, setSearch] = useState('');

  const fetchPosts = async (pageNum = 1, shouldRefresh = false) => {
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 10,
        ...(selectedTags.length > 0 && { tags: selectedTags.join(',') }),
        ...(search && { search })
      });

      const response = await axios.get(`http://localhost:3000/api/posts?${params}`);
      const { data, pagination } = response.data;

      if (shouldRefresh || pageNum === 1) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }

      setHasMore(pagination.currentPage < pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedTags]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchPosts(1, true);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
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
          placeholder="Buscar posts..."
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
          {COMMON_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedTags.includes(tag) ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <Text
                className={`${
                  selectedTags.includes(tag) ? 'text-white' : 'text-gray-700'
                }`}
              >
                #{tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
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
              {loading ? 'Cargando...' : 'No hay posts disponibles'}
            </Text>
          </View>
        )}
      />

      {/* FAB para crear nuevo post (solo para usuarios autorizados) */}
      <TouchableOpacity
        onPress={() => navigation.navigate('CreatePost')}
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full justify-center items-center shadow-lg"
      >
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>
    </View>
  );
}
