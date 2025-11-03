import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AdminNavBar from '../../components/admin/AdminNavBar';
import { ArrowLeft, Users, BookOpen } from 'lucide-react-native';

export default function QRScannerScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Scanner</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>✅ QR Scanner page connected!</Text>
          <Text style={styles.placeholderSubtext}>Feature coming soon...</Text>
        </View>
      </ScrollView>
      {/* Navigation Bar*/}
      <AdminNavBar currentPage="qr" />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  placeholder: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  placeholderSubtext: {
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
    borderColor: '#fff',
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