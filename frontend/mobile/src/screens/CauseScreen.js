import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { CAUSE_CATEGORIES } from '../../src/config/constants';

export default function CauseScreen() {
  const navigation = useNavigation();
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('active'); // active, completed, all

  const fetchCauses = async (pageNum = 1, shouldRefresh = false) => {
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 10,
        status: filter === 'all' ? '' : filter,
        ...(category && { category }),
        ...(search && { search })
      });

      const response = await axios.get(`http://localhost:3000/api/causes?${params}`);
      const { data, pagination } = response.data;

      if (shouldRefresh || pageNum === 1) {
        setCauses(data);
      } else {
        setCauses(prev => [...prev, ...data]);
      }

      setHasMore(pagination.currentPage < pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching causes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCauses();
  }, [category, filter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCauses(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchCauses(page + 1);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchCauses(1, true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderCauseCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('CauseDetail', { id: item.id })}
      className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
    >
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          className="w-full h-48"
          resizeMode="cover"
        />
      )}
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-800 mb-2">
          {item.title}
        </Text>
        <Text className="text-gray-600 mb-3" numberOfLines={2}>
          {item.description}
        </Text>

        <View className="flex-row justify-between items-center mb-3">
          <View className={`rounded-full px-3 py-1 ${getStatusColor(item.status)}`}>
            <Text className="text-sm capitalize">
              {item.status}
            </Text>
          </View>
          <Text className="text-primary font-bold">
            ${item.amount.toLocaleString()}
          </Text>
        </View>

        <View className="bg-gray-100 rounded-lg p-3">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Recaudado</Text>
            <Text className="text-gray-800 font-bold">
              ${item.raisedAmount.toLocaleString()}
            </Text>
          </View>
          <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
            <View
              className="bg-primary h-full rounded-full"
              style={{
                width: `${Math.min((item.raisedAmount / item.amount) * 100, 100)}%`,
              }}
            />
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-3">
          <View className="flex-row items-center">
            {item.user?.imageUrl ? (
              <Image
                source={{ uri: item.user.imageUrl }}
                className="w-6 h-6 rounded-full mr-2"
              />
            ) : (
              <View className="w-6 h-6 rounded-full bg-gray-300 mr-2" />
            )}
            <Text className="text-gray-600">
              {item.user?.firstName} {item.user?.lastName}
            </Text>
          </View>
          <Text className="text-gray-500 text-sm">
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          placeholder="Buscar causas..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {['active', 'completed', 'all'].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setFilter(status)}
              className={`px-4 py-2 rounded-full mr-2 ${
                filter === status ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <Text
                className={`${
                  filter === status ? 'text-white' : 'text-gray-700'
                } capitalize`}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Categories */}
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
          {Object.entries(CAUSE_CATEGORIES).map(([key, value]) => (
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
        data={causes}
        renderItem={renderCauseCard}
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
              {loading ? 'Cargando...' : 'No hay causas disponibles'}
            </Text>
          </View>
        )}
      />

      {/* FAB para crear nueva causa */}
      <TouchableOpacity
        onPress={() => navigation.navigate('CreateCause')}
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full justify-center items-center shadow-lg"
      >
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>
    </View>
  );
}
