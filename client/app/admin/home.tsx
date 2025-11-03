import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, LogOut, Users, BookOpen } from 'lucide-react-native';
import AdminNavBar from '../../components/admin/AdminNavBar';
import { getUserData, removeToken } from '../../src/utils/storage';

export default function AdminHomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const data = await getUserData();
    setUserData(data);
  };

  const handleLogout = async () => {
    await removeToken();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userData?.name?.charAt(0) || 'A'}
            </Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userData?.name || 'Admin'} !</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleLogout}
          >
            <LogOut size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Button */}
      <TouchableOpacity 
        style={styles.notificationButton}
        onPress={() => router.push('/admin/notifications')}
      >
        <Bell size={24} color="#000" />
      </TouchableOpacity>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Account Management Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/admin/account-management')}
        >
          
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Account Management</Text>
            <Text style={styles.cardDescription}>• Description</Text>
          </View>
        </TouchableOpacity>

        {/* Book Management Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/admin/book-management')}
        >
          
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Book Management</Text>
            <Text style={styles.cardDescription}>• Description</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Navigation Bar*/}
      <AdminNavBar currentPage="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d4a5b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  notificationButton: {
    position: 'absolute',
    top: 140,
    right: 20,
    padding: 8,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContent: {
    flexGrow: 1, // ensures full height scroll area
    justifyContent: 'center', // centers content vertically
    alignItems: 'center', // centers horizontally
    paddingVertical: 40, // adds spacing top/bottom for scroll
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    width: '90%'
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
  },
  cardImageBook: {
    width: 80,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
    tintColor: '#5dadec',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#999',
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#d4a5b8',
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  navIconActive: {
    backgroundColor: '#4a4a4a',
    borderRadius: 20,
    padding: 8,
  },
  qrIcon: {
    width: 28,
    height: 28,
    position: 'relative',
  },
  qrSquare: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: '#4a4a4a',
    borderRadius: 2,
  },
  qrSquareTopRight: {
    right: 0,
  },
  qrSquareBottomLeft: {
    bottom: 0,
  },
  qrSquareBottomRight: {
    right: 0,
    bottom: 0,
  },
});