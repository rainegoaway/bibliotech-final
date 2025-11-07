import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import api from '../../src/services/api';

interface ViewUserModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    id: number;
    school_id: string;
    name: string;
    email: string;
    role: string;
    course?: string;
    year_level?: number;
    is_active: boolean;
    created_at: string;
  } | null;
}

interface Subject {
  id: number;
  code: string;
  name: string;
  category: string;
}

interface Genre {
  id: number;
  name: string;
  icon: string;
  color: string;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ visible, onClose, user }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible && user) {
      fetchUserDetails();
    }
  }, [visible, user]);

  const fetchUserDetails = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Fetch user's subjects - backend returns { count: X, subjects: [...] }
      const subjectsResponse = await api.get(`/users/${user.id}/subjects`);
      setSubjects(subjectsResponse.data.subjects || subjectsResponse.data || []);

      // Fetch user's genres - backend returns { count: X, genres: [...] }
      const genresResponse = await api.get(`/users/${user.id}/genres`);
      setGenres(genresResponse.data.genres || genresResponse.data || []);
    } catch (err: any) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#d4a5b8';
      case 'student':
        return '#a8c9a0';
      case 'teacher':
        return '#a0c4e1';
      default:
        return '#999';
    }
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) {
      return 'N/A'; // Or some other placeholder for missing date
    }
    // Ensure the date string is in a format Date constructor can reliably parse (e.g., ISO 8601)
    // Assuming dateString is like "YYYY-MM-DD HH:mm:ss", convert to "YYYY-MM-DDTHH:mm:ssZ"
    const date = new Date(dateString.replace(' ', 'T') + 'Z');
    // Check if the date is valid before formatting
    if (isNaN(date.getTime())) {
      return 'Invalid Date'; // Or handle as appropriate
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>User Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>

              <View style={styles.infoRow}>
                <Text style={styles.label}>School ID:</Text>
                <Text style={styles.value}>{user.school_id}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{user.name}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{user.email}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Role:</Text>
                <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) }]}>
                  <Text style={styles.roleBadgeText}>{user.role.toUpperCase()}</Text>
                </View>
              </View>

              {user.course && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Course:</Text>
                  <Text style={styles.value}>{user.course}</Text>
                </View>
              )}

              {user.year_level && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Year Level:</Text>
                  <Text style={styles.value}>Year {user.year_level}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.label}>Status:</Text>
                <View style={[styles.statusBadge, user.is_active ? styles.activeStatus : styles.inactiveStatus]}>
                  <Text style={styles.statusText}>{user.is_active ? 'Active' : 'Inactive'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Created:</Text>
                <Text style={styles.value}>{formatDate(user.created_at)}</Text>
              </View>
            </View>

            {/* Subjects Section */}
            {user.role === 'student' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Assigned Subjects</Text>
                {loading ? (
                  <ActivityIndicator size="small" color="#d4a5b8" style={styles.loader} />
                ) : subjects.length > 0 ? (
                  <View style={styles.tagsContainer}>
                    {subjects.map((subject) => (
                      <View key={subject.id} style={styles.subjectTag}>
                        <Text style={styles.subjectCode}>{subject.code}</Text>
                        <Text style={styles.subjectName}>{subject.name}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No subjects assigned yet</Text>
                )}
              </View>
            )}

            {/* Genres Section */}
            {user.role === 'student' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Genre Preferences</Text>
                {loading ? (
                  <ActivityIndicator size="small" color="#d4a5b8" style={styles.loader} />
                ) : genres.length > 0 ? (
                  <View style={styles.tagsContainer}>
                    {genres.map((genre) => (
                      <View 
                        key={genre.id} 
                        style={[styles.genreTag, { backgroundColor: genre.color + '20' }]}
                      >
                        <Text style={styles.genreIcon}>{genre.icon}</Text>
                        <Text style={[styles.genreName, { color: genre.color }]}>
                          {genre.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No genres selected yet</Text>
                )}
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.closeFooterButton} onPress={onClose}>
              <Text style={styles.closeFooterButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
    maxWidth: '60%',
    textAlign: 'right',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeStatus: {
    backgroundColor: '#d4edda',
  },
  inactiveStatus: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#a8c9a0',
  },
  subjectCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  subjectName: {
    fontSize: 11,
    color: '#666',
  },
  genreTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  genreIcon: {
    fontSize: 16,
  },
  genreName: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  loader: {
    paddingVertical: 12,
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    color: '#c33',
    fontSize: 13,
    textAlign: 'center',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  closeFooterButton: {
    backgroundColor: '#d4a5b8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeFooterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ViewUserModal;