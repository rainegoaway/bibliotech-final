import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { notificationsAPI } from '@/src/services/api';
import { getToken } from '@/src/utils/storage';
import * as SystemUI from 'expo-system-ui';

export default function RootLayout() {
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync('#f5f5f5');
    }
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await getToken();
        if (!token) {
          // User is not logged in, do not fetch notifications
          setUnreadNotificationsCount(0);
          initialFetchDone.current = true;
          return;
        }

        const response = await notificationsAPI.getNotifications();
        const unread = response.data.filter((notif: any) => !notif.is_read).length;

        if (initialFetchDone.current && unread > unreadNotificationsCount) {
          // Only show alert if new unread notifications appear after initial load
          Alert.alert(
            'New Notification!',
            `You have ${unread - unreadNotificationsCount} new notification(s).`,
            [
              { text: 'OK', onPress: () => console.log('OK Pressed') },
            ],
            { cancelable: false }
          );
        }
        setUnreadNotificationsCount(unread);
        initialFetchDone.current = true;
      } catch (error) {
        console.error('Failed to fetch notifications in _layout:', error);
      }
    };

    // Fetch immediately and then every 30 seconds
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId);
  }, [unreadNotificationsCount]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="admin/home" />
        <Stack.Screen name="admin/notifications" />
        <Stack.Screen name="admin/account-management" />
        <Stack.Screen name="admin/book-management" />
        <Stack.Screen name="admin/qr-scanner" />
        <Stack.Screen name="student/home" />
        <Stack.Screen name="student/first-time-setup" />

      </Stack>
    </GestureHandlerRootView>
  );
}