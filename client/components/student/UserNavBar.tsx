import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Bell, Clock, User } from 'lucide-react-native';

export default function UserNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <View style={styles.navbar}>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => router.push('/student/home')}
      >
        {isActive('/student/home') ? (
          <View style={styles.navIconActive}>
            <Home size={24} color="#fff" />
          </View>
        ) : (
          <Home size={24} color="#4a4a4a" />
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => router.push('/student/notifications')}
      >
        {isActive('/student/notifications') ? (
          <View style={styles.navIconActive}>
            <Bell size={24} color="#fff" />
          </View>
        ) : (
          <Bell size={24} color="#4a4a4a" />
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => router.push('/student/profile')}
      >
        {isActive('/student/profile') ? (
          <View style={styles.navIconActive}>
            <User size={24} color="#fff" />
          </View>
        ) : (
          <User size={24} color="#4a4a4a" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
});