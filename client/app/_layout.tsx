import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
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
  );
}