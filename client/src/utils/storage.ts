// Update or add these functions to client/src/utils/storage.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// Token management
export const storeToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing token:', error);
    throw error;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_DATA_KEY); // Also remove user data
  } catch (error) {
    console.error('Error removing token:', error);
    throw error;
  }
};

// User data management
export const storeUserData = async (userData: any): Promise<void> => {
  try {
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
    throw error;
  }
};

export const saveUserData = async (userData: any): Promise<void> => {
  // Alias for storeUserData
  return storeUserData(userData);
};

export const getUserData = async (): Promise<any | null> => {
  try {
    const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const updateUserData = async (updates: Partial<any>): Promise<void> => {
  try {
    const currentData = await getUserData();
    if (currentData) {
      const updatedData = { ...currentData, ...updates };
      await storeUserData(updatedData);
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};