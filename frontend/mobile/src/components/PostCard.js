import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Share from 'react-native-share';

export default function PostCard({ post }) {
  const navigation = useNavigation();

  const handleShare = async () => {
    try {
      await Share.open({
        title: post.title,
        message: `${post.title}\n\n${post.content.substring(0, 100)}...`,
        url: `https://artistsaid.com/blog/${post.id}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <View className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
      {post.imageUrl && (
        <Image
          source={{ uri: post.imageUrl }}
          className="w-full h-48"
          resizeMode="cover"
        />
      )}
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-800 mb-2">
          {post.title}
        </Text>
        <Text className="text-gray-600 mb-4">
          {post.content.substring(0, 100)}...
        </Text>
        <View className="flex-row flex-wrap mb-3">
          {post.tags.map((tag, index) => (
            <View
              key={index}
              className="bg-gray-200 rounded-full px-2 py-1 mr-2 mb-2"
            >
              <Text className="text-xs text-gray-700">#{tag}</Text>
            </View>
          ))}
        </View>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              onPress={handleShare}
              className="bg-primary rounded-full p-2 mr-2"
            >
              <Text className="text-white">Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('PostDetail', { id: post.id })}
              className="bg-secondary rounded-full p-2"
            >
              <Text className="text-white">Read More</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row mt-3 justify-between">
          <View className="flex-row items-center">
            <Text className="text-gray-500">👍 {post.likesCount}</Text>
            <Text className="text-gray-500 ml-4">👁️ {post.views}</Text>
          </View>
          {post.author && (
            <View className="flex-row items-center">
              {post.author.imageUrl ? (
                <Image
                  source={{ uri: post.author.imageUrl }}
                  className="w-6 h-6 rounded-full mr-2"
                />
              ) : (
                <View className="w-6 h-6 rounded-full bg-gray-300 mr-2" />
              )}
              <Text className="text-gray-500">
                {post.author.firstName} {post.author.lastName}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
