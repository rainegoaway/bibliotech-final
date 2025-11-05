import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
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