// Reusable role filter toggle (All/Admin/Student)
// ============================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type RoleType = 'all' | 'admin' | 'student';

interface RoleFilterProps {
  selectedRole: RoleType;
  onRoleChange: (role: RoleType) => void;
}

export default function RoleFilter({ selectedRole, onRoleChange }: RoleFilterProps) {
  
  const roles: { key: RoleType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'admin', label: 'Admin' },
    { key: 'student', label: 'Student' },
  ];

  return (
    <View style={styles.container}>
      {roles.map((role) => (
        <TouchableOpacity
          key={role.key}
          style={[
            styles.button,
            selectedRole === role.key && styles.buttonActive,
          ]}
          onPress={() => onRoleChange(role.key)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              selectedRole === role.key && styles.buttonTextActive,
            ]}
          >
            {role.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: '#d4a5b8', // Primary pink
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  buttonTextActive: {
    color: '#fff',
  },
});