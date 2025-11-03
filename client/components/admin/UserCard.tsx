// client/src/components/UserCard.tsx
// Individual user card with action buttons
// ============================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Edit2, Trash2, Eye, KeyRound } from 'lucide-react-native';

interface User {
  id: number;
  school_id: string;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'teacher';
  course?: string;
  year_level?: number;
  is_active: boolean;
  created_at: string;  // <- ensure this exists!
  updated_at?: string;
  last_login?: string;
}


interface UserCardProps {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void; // ✅ NEW PROP
}

export default function UserCard({ 
  user, 
  onView, 
  onEdit, 
  onDelete,
  onResetPassword // ✅ NEW PROP
}: UserCardProps) {
  
  const getRoleBadgeColor = () => {
    switch(user.role) {
      case 'admin': return '#d4a5b8'; // Pink
      case 'student': return '#a8c9a0'; // Green
      case 'teacher': return '#a0c4e1'; // Blue
      default: return '#ccc';
    }
  };

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: getRoleBadgeColor() }]}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.schoolId}>{user.school_id}</Text>
        </View>

        <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor() }]}>
          <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
        </View>
      </View>

      {/* Details Row */}
      <View style={styles.details}>
        <Text style={styles.detailText} numberOfLines={1}>
          📧 {user.email}
        </Text>
        {user.course && (
          <Text style={styles.detailText}>
            🎓 {user.course} {user.year_level ? `- Year ${user.year_level}` : ''}
          </Text>
        )}
        <Text style={[styles.statusText, !user.is_active && styles.inactiveText]}>
          {user.is_active ? '🟢 Active' : '🔴 Inactive'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => onView(user)}
        >
          <Eye size={16} color="#fff" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(user)}
        >
          <Edit2 size={16} color="#fff" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        {/* ✅ NEW - Reset Password Button */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.resetButton]}
          onPress={() => onResetPassword(user)}
        >
          <KeyRound size={16} color="#fff" />
          <Text style={styles.actionText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(user)}
        >
          <Trash2 size={16} color="#fff" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  schoolId: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  details: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  inactiveText: {
    color: '#e74c3c',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  viewButton: {
    backgroundColor: '#3498db',
  },
  editButton: {
    backgroundColor: '#f39c12',
  },
  resetButton: {
    backgroundColor: '#8b5cf6', 
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});