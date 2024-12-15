import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
/**
 * Upload a file to Firebase Storage.
 * @param path The path in the storage bucket where the file will be stored.
 * @param file The file to upload.
 * @returns A promise resolving with the uploaded file's reference.
 */
export const uploadFile = async (path: string, file: File): Promise<string> => {
  try {
    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, path);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    console.log('File uploaded:', snapshot.ref.fullPath);
    // Return the download URL
    return snapshot.ref.fullPath;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file to Firebase Storage.');
  }
};

/**
 * Get the download URL for a file stored in Firebase Storage.
 * @param path The path to the file in the storage bucket.
 * @returns A promise resolving with the download URL.
 */
export const getFileURL = async (path: string): Promise<string> => {
  try {
    const fileRef = ref(storage, path);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error fetching file URL:', error);
    throw new Error('Failed to fetch file URL.');
  }
};
