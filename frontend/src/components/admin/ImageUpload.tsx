'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useStorage } from '@/hooks/useStorage';
import Image from 'next/image';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  folder?: string;
}

export default function ImageUpload({ 
  onImageUploaded, 
  currentImageUrl,
  folder = 'images'
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>(currentImageUrl || '');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploadProgress } = useStorage();

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const url = await uploadFile(file, folder);
      setImageUrl(url);
      onImageUploaded(url);
    } catch (error: any) {
      setError(error.message || 'Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput) {
      setError('Por favor, ingresa una URL válida');
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
      setImageUrl(urlInput);
      onImageUploaded(urlInput);
      setError(null);
    } catch {
      setError('Por favor, ingresa una URL válida');
    }
  };

  return (
    <div className="space-y-4">
      {/* Image preview */}
      {imageUrl && (
        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${uploadProgress.progress}%` }}
          ></div>
          <p className="text-sm text-gray-600 mt-1">
            Subiendo... {Math.round(uploadProgress.progress)}%
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {/* Upload options */}
      <div className="space-y-4">
        {/* File upload */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            Subir imagen desde el dispositivo
          </button>
        </div>

        {/* URL input */}
        <div className="space-y-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="O ingresa la URL de la imagen"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleUrlSubmit}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Usar URL
          </button>
        </div>
      </div>
    </div>
  );
}
