// client/app/admin/account-management.tsx
// Main account management page with CRUD operations
// ============================================

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, UserPlus } from 'lucide-react-native';
import SearchBar from '../../components/admin/SearchBar';
import RoleFilter from '../../components/admin/RoleFilter';
import UserCard from '../../components/admin/UserCard';
import AdminNavBar from '../../components/admin/AdminNavBar';
import CreateUserModal from '../../components/admin/CreateUserModal';
import ViewUserModal from '../../components/admin/ViewUserModal';
import EditUserModal from '../../components/admin/EditUserModal';
import api from '../../src/services/api';

interface User {
  id: number;
  school_id: string;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'teacher';
  course?: string;
  year_level?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

type RoleType = 'all' | 'admin' | 'student';

export default function AccountManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType>('all');
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false); 
  const [editModalVisible, setEditModalVisible] = useState(false); 
  const [selectedUser, setSelectedUser] = useState<User | null>(null); 

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters whenever search or role changes
  useEffect(() => {
    if (users.length > 0) {
      applyFilters();
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery, selectedRole, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      console.log('API Response:', response.data);
      
      // Handle different response structures
      const usersList = response.data.users || response.data || [];
      setUsers(usersList);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      Alert.alert(
        'Error', 
        error.response?.data?.error || 'Failed to load users. Make sure backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by search query (name, school_id, email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(user => {
        // Safely check each field for null/undefined before calling toLowerCase
        const name = user.name?.toLowerCase() || '';
        const schoolId = user.school_id?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        
        return name.includes(query) || 
               schoolId.includes(query) || 
               email.includes(query);
      });
    }

    console.log('Filtered users:', filtered.length);
    setFilteredUsers(filtered);
  };

  // View user details
  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewModalVisible(true);
  };

  // Edit user - NOW WORKING! 🎉
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditModalVisible(true);
  };

  const handleDelete = (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/users/${user.id}`);
              Alert.alert('Success', 'User deleted successfully');
              fetchUsers(); // Refresh list
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

    const handleResetPassword = (user: User) => {
    Alert.alert(
      '🔑 Reset Password',
      `Generate a new temporary password for ${user.name}?\n\nSchool ID: ${user.school_id}`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        {
          text: 'Reset Password',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.post(`/users/${user.id}/reset-password`);
              
              // Show the temp password in an alert
              Alert.alert(
                '✅ Password Reset Successful',
                `New temporary password for ${user.name}:\n\n` +
                `📋 ${response.data.tempPassword}\n\n` +
                `Please provide this password to the user. They will be required to change it on first login.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Optionally refresh the user list
                      fetchUsers();
                    }
                  }
                ]
              );
            } catch (error: any) {
              console.error('Reset password error:', error);
              Alert.alert(
                'Error', 
                error.response?.data?.error || 'Failed to reset password. Please try again.'
              );
            }
          }
        }
      ]
    );
  };

  //create
  const handleCreateUser = () => {
    setCreateModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Account Management</Text>
        
        <TouchableOpacity 
          onPress={handleCreateUser}
          style={styles.addButton}
        >
          <UserPlus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, ID, or email..."
        />
      </View>

      {/* Role Filter */}
      <View style={styles.filterContainer}>
        <RoleFilter
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
        />
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
        </Text>
      </View>

      {/* User List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d4a5b8" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery || selectedRole !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Create your first user to get started'}
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onResetPassword={handleResetPassword}
            />
          ))}
        </ScrollView>
      )}
      </View>

      {/* Create User Modal */}
      <CreateUserModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={fetchUsers}
      />

      {/* View User Modal */}
      <ViewUserModal
        visible={viewModalVisible}
        user={selectedUser}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedUser(null);
        }}
      />

      <EditUserModal
        visible={editModalVisible}
        user={selectedUser}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedUser(null);
        }}
        onSuccess={fetchUsers}
      /> 

      {/* Bottom Navigation */}
      <AdminNavBar currentPage="account" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#d4a5b8',
    padding: 10,
    borderRadius: 12,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});