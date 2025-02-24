import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Share from 'react-native-share';

export default function NewsCard({ item }) {
  const navigation = useNavigation();

  const handleShare = async () => {
    try {
      await Share.open({
        title: item.title,
        message: `${item.title}\n\n${item.content.substring(0, 100)}...`,
        url: `https://artistsaid.com/news/${item.id}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <View className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
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
        <Text className="text-gray-600 mb-4">
          {item.content.substring(0, 100)}...
        </Text>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <View className="bg-primary rounded-full px-2 py-1 ml-2">
              <Text className="text-white text-xs">{item.category}</Text>
            </View>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              onPress={handleShare}
              className="bg-primary rounded-full p-2 mr-2"
            >
              <Text className="text-white">Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('NewsDetail', { id: item.id })}
              className="bg-secondary rounded-full p-2"
            >
              <Text className="text-white">Read More</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row mt-3 justify-between">
          <View className="flex-row items-center">
            <Text className="text-gray-500">👍 {item.likesCount}</Text>
            <Text className="text-gray-500 ml-4">👁️ {item.views}</Text>
          </View>
          {item.author && (
            <Text className="text-gray-500">
              By {item.author.firstName} {item.author.lastName}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
