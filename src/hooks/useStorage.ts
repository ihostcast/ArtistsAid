'use client';

import { useState } from 'react';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  StorageReference
} from 'firebase/storage';
import { storage } from '@/config/firebase';

interface UploadProgress {
  progress: number;
  url: string | null;
  error: string | null;
}

export function useStorage() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    url: null,
    error: null
  });

  const uploadFile = async (
    file: File,
    path: string,
    metadata = {}
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Create file reference
      const storageRef = ref(storage, `${path}/${file.name}`);
      
      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        ...metadata
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Get upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({ ...prev, progress }));
        },
        (error) => {
          // Handle errors
          console.error('Error uploading file:', error);
          setUploadProgress(prev => ({ ...prev, error: error.message }));
          reject(error);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadProgress(prev => ({ 
              ...prev, 
              url: downloadURL,
              progress: 100 
            }));
            resolve(downloadURL);
          } catch (error: any) {
            console.error('Error getting download URL:', error);
            setUploadProgress(prev => ({ ...prev, error: error.message }));
            reject(error);
          }
        }
      );
    });
  };

  const deleteFile = async (url: string): Promise<void> => {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error: any) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  return {
    uploadFile,
    deleteFile,
    uploadProgress
  };
}
