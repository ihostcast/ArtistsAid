import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    totalFunds: 0,
    activeCauses: 0,
    totalDonations: 0,
    recentNews: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-primary p-6">
        <Text className="text-white text-3xl font-bold mb-2">
          ArtistsAid
        </Text>
        <Text className="text-white opacity-80">
          Apoyando a la comunidad artística
        </Text>
      </View>

      {/* Stats Cards */}
      <View className="px-4 -mt-6">
        <View className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <Text className="text-gray-600 mb-2">Fondos Disponibles</Text>
          <Text className="text-3xl font-bold text-primary">
            ${stats.totalFunds.toLocaleString()}
          </Text>
        </View>

        <View className="flex-row justify-between mb-4">
          <View className="bg-white rounded-xl shadow-lg p-4 flex-1 mr-2">
            <Text className="text-gray-600 mb-2">Causas Activas</Text>
            <Text className="text-2xl font-bold text-secondary">
              {stats.activeCauses}
            </Text>
          </View>
          <View className="bg-white rounded-xl shadow-lg p-4 flex-1 ml-2">
            <Text className="text-gray-600 mb-2">Donaciones</Text>
            <Text className="text-2xl font-bold text-success">
              {stats.totalDonations}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-4 mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Acciones Rápidas
        </Text>
        <View className="flex-row flex-wrap justify-between">
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateCause')}
            className="bg-white rounded-xl shadow-lg p-4 w-[48%] mb-4"
          >
            <Text className="text-primary font-bold mb-2">Crear Causa</Text>
            <Text className="text-gray-600 text-sm">
              Inicia una nueva causa para apoyo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Donate')}
            className="bg-white rounded-xl shadow-lg p-4 w-[48%] mb-4"
          >
            <Text className="text-secondary font-bold mb-2">Donar</Text>
            <Text className="text-gray-600 text-sm">
              Apoya una causa existente
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent News */}
      <View className="px-4 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-800">
            Últimas Noticias
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('News')}>
            <Text className="text-primary">Ver todas</Text>
          </TouchableOpacity>
        </View>
        {stats.recentNews.map((news) => (
          <TouchableOpacity
            key={news.id}
            onPress={() => navigation.navigate('NewsDetail', { id: news.id })}
            className="bg-white rounded-xl shadow-lg p-4 mb-4"
          >
            {news.imageUrl && (
              <Image
                source={{ uri: news.imageUrl }}
                className="w-full h-40 rounded-lg mb-3"
                resizeMode="cover"
              />
            )}
            <Text className="text-lg font-bold text-gray-800 mb-2">
              {news.title}
            </Text>
            <Text className="text-gray-600 mb-2" numberOfLines={2}>
              {news.content}
            </Text>
            <Text className="text-gray-500 text-sm">
              {new Date(news.createdAt).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
