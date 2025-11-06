import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, Mail, MailOpen } from 'lucide-react-native';
import UserNavBar from '@/components/student/UserNavBar';
import { notificationsAPI } from '@/src/services/api';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  related_book_id: number | null;
  related_borrow_id: number | null;
  is_read: boolean;
  read_at: string | null;
  created_date: string;
}

const NotificationItem: React.FC<{ notification: Notification; onMarkAsRead: (id: number) => void }> = ({
  notification,
  onMarkAsRead,
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    // Optional: Navigate to related book/borrow/reservation detail
    if (notification.related_book_id) {
      router.push(`/student/book-view/${notification.related_book_id}`);
    } else if (notification.related_borrow_id) {
      // Handle navigation to borrow details if such a screen exists
      // router.push(`/student/borrow-details/${notification.related_borrow_id}`);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.notificationItem, notification.is_read ? styles.readItem : styles.unreadItem]}
      onPress={handlePress}
    >
      <View style={styles.notificationIcon}>
        {notification.is_read ? <MailOpen size={20} color="#666" /> : <Mail size={20} color="#007bff" />}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTime}>
          {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationsAPI.getNotifications();
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsAPI.markNotificationAsRead(id);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => (notif.id === id ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Optionally, show an error message to the user
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchNotifications} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      {notifications.length === 0 ? (
        <View style={[styles.content, styles.centered]}>
          <Text style={styles.placeholderText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <NotificationItem notification={item} onMarkAsRead={handleMarkAsRead} />}
          contentContainerStyle={styles.notificationList}
        />
      )}

      {/* Bottom Navigation */}
      <UserNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  notificationList: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  readItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#ccc',
    opacity: 0.8,
  },
  notificationIcon: {
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
});
