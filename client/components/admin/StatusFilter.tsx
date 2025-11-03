import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

type StatusType = 'all' | 'available' | 'borrowed' | 'reserved' | 'maintenance';

interface StatusFilterProps {
  selectedStatus: StatusType;
  onStatusChange: (status: StatusType) => void;
}

export default function StatusFilter({ selectedStatus, onStatusChange }: StatusFilterProps) {
  
  const statuses: { key: StatusType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Available' },
    { key: 'borrowed', label: 'Borrowed' },
    { key: 'reserved', label: 'Reserved' },
    { key: 'maintenance', label: 'Maintenance' },
  ];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        {statuses.map((status) => (
          <TouchableOpacity
            key={status.key}
            style={[
              styles.button,
              selectedStatus === status.key && styles.buttonActive,
            ]}
            onPress={() => onStatusChange(status.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.buttonText,
                selectedStatus === status.key && styles.buttonTextActive,
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
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
    minWidth: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
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