import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { FAQ_CATEGORIES } from '../../src/config/constants';

export default function FAQScreen() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchFAQs = async () => {
    try {
      const params = new URLSearchParams(
        selectedCategory ? { category: selectedCategory } : {}
      );

      const response = await axios.get(`http://localhost:3000/api/faq?${params}`);
      setFaqs(response.data.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, [selectedCategory]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFAQs();
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading && !refreshing) {
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
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-primary p-6">
        <Text className="text-white text-2xl font-bold">
          Preguntas Frecuentes
        </Text>
        <Text className="text-white opacity-80">
          Encuentra respuestas a tus dudas
        </Text>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="py-4 px-2 bg-white"
      >
        <TouchableOpacity
          onPress={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full mr-2 ${
            selectedCategory === '' ? 'bg-primary' : 'bg-gray-200'
          }`}
        >
          <Text
            className={`${
              selectedCategory === '' ? 'text-white' : 'text-gray-700'
            }`}
          >
            Todas
          </Text>
        </TouchableOpacity>
        {Object.entries(FAQ_CATEGORIES).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setSelectedCategory(value)}
            className={`px-4 py-2 rounded-full mr-2 ${
              selectedCategory === value ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <Text
              className={`${
                selectedCategory === value ? 'text-white' : 'text-gray-700'
              }`}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAQs */}
      <View className="p-4">
        {faqs.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            onPress={() => toggleExpand(faq.id)}
            className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
          >
            <View className="p-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-semibold text-gray-800 flex-1 pr-4">
                  {faq.question}
                </Text>
                <Text className="text-2xl text-gray-500">
                  {expandedId === faq.id ? '−' : '+'}
                </Text>
              </View>
              {expandedId === faq.id && (
                <Text className="text-gray-600 mt-3">
                  {faq.answer}
                </Text>
              )}
            </View>
            {faq.category && (
              <View className="px-4 pb-3">
                <View className="bg-gray-100 self-start rounded-full px-2 py-1">
                  <Text className="text-xs text-gray-600">
                    {faq.category}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {faqs.length === 0 && (
          <View className="py-8 items-center">
            <Text className="text-gray-500 text-lg">
              No hay preguntas frecuentes disponibles
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
