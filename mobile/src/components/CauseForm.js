import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'react-native-document-picker';
import axios from 'axios';

export default function CauseForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDocumentPick = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        allowMultiSelection: true,
      });

      setDocuments([...documents, ...results]);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Error al seleccionar documentos');
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.amount) {
      Alert.alert('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      documents.forEach((doc, index) => {
        formData.append('documents', {
          uri: doc.uri,
          type: doc.type,
          name: doc.name,
        });
      });

      const token = await AsyncStorage.getItem('token');
      await axios.post('http://localhost:3000/api/causes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Éxito', 'Causa creada exitosamente');
      setForm({ title: '', description: '', amount: '', category: '' });
      setDocuments([]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Error al crear la causa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-6">
        Crear Nueva Causa
      </Text>

      <View className="mb-4">
        <Text className="text-gray-600 mb-2">Título</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          value={form.title}
          onChangeText={(text) => setForm({ ...form, title: text })}
          placeholder="Título de la causa"
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-600 mb-2">Descripción</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          value={form.description}
          onChangeText={(text) => setForm({ ...form, description: text })}
          placeholder="Describe tu causa"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-600 mb-2">Monto Requerido</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          value={form.amount}
          onChangeText={(text) => setForm({ ...form, amount: text })}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
      </View>

      <View className="mb-6">
        <Text className="text-gray-600 mb-2">Documentos de Respaldo</Text>
        <TouchableOpacity
          onPress={handleDocumentPick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 items-center justify-center"
        >
          <Text className="text-primary">Seleccionar Documentos</Text>
        </TouchableOpacity>
        {documents.length > 0 && (
          <View className="mt-2">
            {documents.map((doc, index) => (
              <Text key={index} className="text-gray-600">
                📎 {doc.name}
              </Text>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className={`rounded-lg p-4 ${
          loading ? 'bg-gray-400' : 'bg-primary'
        }`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-bold">
            Crear Causa
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
