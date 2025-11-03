// Reusable bottom navigation bar for admin pages
// ============================================

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Home, Users, BookOpen, ScanLine } from 'lucide-react-native';

type AdminPage = 'home' | 'account' | 'book' | 'qr';

interface AdminNavBarProps {
  currentPage: AdminPage;
}

export default function AdminNavBar({ currentPage }: AdminNavBarProps) {
  const pathname = usePathname();

  // Navigation handlers
const navigateTo = (page: string) => {
  router.push(`/admin/${page}` as any);
};

  const isActive = (page: AdminPage) => currentPage === page;

  return (
    <View style={styles.navbar}>
      {/* Home */}
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigateTo('home')}
      >
        {isActive('home') ? (
          <View style={styles.navIconActive}>
            <Home size={24} color="#fff" />
          </View>
        ) : (
          <Home size={24} color="#4a4a4a" />
        )}
      </TouchableOpacity>

      {/* Account Management */}
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigateTo('account-management')}
      >
        {isActive('account') ? (
          <View style={styles.navIconActive}>
            <Users size={24} color="#fff" />
          </View>
        ) : (
          <Users size={24} color="#4a4a4a" />
        )}
      </TouchableOpacity>

      {/* Book Management */}
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigateTo('book-management')}
      >
        {isActive('book') ? (
          <View style={styles.navIconActive}>
            <BookOpen size={24} color="#fff" />
          </View>
        ) : (
          <BookOpen size={24} color="#4a4a4a" />
        )}
      </TouchableOpacity>

      {/* QR Scanner */}
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigateTo('qr-scanner')}
      >
        {isActive('qr') ? (
          <View style={styles.navIconActive}>
            <ScanLine size={24} color="#fff" />
          </View>
        ) : (
          <ScanLine size={24} color="#4a4a4a" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#d4a5b8',
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
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
});