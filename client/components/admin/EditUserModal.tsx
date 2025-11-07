import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import api from '../../src/services/api';

interface EditUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: {
    id: number;
    school_id: string;
    name: string;
    email: string;
    role: string;
    course?: string;
    year_level?: number;
    is_active: boolean;
  } | null;
}

interface Course {
  id: number;
  code: string;
  name: string;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ visible, onClose, onSuccess, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    course: '',
    year_level: 1,
    is_active: true,
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      fetchCourses();
      if (user) {
        // Pre-fill form with user data
        setFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'student',
          course: user.course || '',
          year_level: user.year_level || 1,
          is_active: user.is_active ?? true,
        });
      }
    }
  }, [visible, user]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await api.get('/subjects/courses');
      console.log('Courses API response:', response.data);
      
      // Backend returns { count: X, courses: [...] }
      const coursesData = response.data.courses || response.data || [];
      console.log('Parsed courses:', coursesData);
      setCourses(coursesData);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
      setCourses([]); // Set empty array on error
    } finally {
      setLoadingCourses(false);
    }
  };

const handleSubmit = async () => {
  // Validation
  if (!formData.name.trim()) {
    setError('Name is required');
    return;
  }

  if (!formData.email.trim()) {
    setError('Email is required');
    return;
  }

  if (formData.role === 'student' && !formData.course) {
    setError('Course is required for students');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const updateData: any = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      is_active: formData.is_active,
    };

    // Add course and year_level for students AND pass old values
    if (formData.role === 'student') {
      updateData.course = formData.course;
      updateData.year_level = formData.year_level;
      updateData.oldCourse = user?.course;
      updateData.oldYearLevel = user?.year_level;
    }

    const res = await api.put(`/users/${user?.id}`, updateData);

    // ✅ Optional: Show how many subjects got reassigned
    const reassigned = res.data?.reassignedSubjects || 0;
    const message =
      reassigned > 0
        ? `User updated successfully! (${reassigned} subjects reassigned)`
        : 'User updated successfully!';

    Alert.alert('Success', message, [
      {
        text: 'OK',
        onPress: () => {
          onSuccess();
          onClose();
        },
      },
    ]);
  } catch (err: any) {
    console.error('Update user error:', err);
    setError(err.response?.data?.message || 'Failed to update user');
  } finally {
    setLoading(false);
  }
};


  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role,
      course: role === 'student' ? prev.course : '',
      year_level: role === 'student' ? prev.year_level : 1,
    }));
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
            <Text style={styles.modalTitle}>Edit User</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* School ID (Read-only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>School ID</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>{user.school_id}</Text>
              </View>
              <Text style={styles.helperText}>School ID cannot be changed</Text>
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter full name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter email address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Role Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Role *</Text>
              <View style={styles.roleContainer}>
                {['student', 'admin'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      formData.role === role && styles.roleButtonActive,
                    ]}
                    onPress={() => handleRoleChange(role)}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        formData.role === role && styles.roleButtonTextActive,
                      ]}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Course (Students Only) */}
            {formData.role === 'student' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Course *</Text>
                  {loadingCourses ? (
                    <ActivityIndicator size="small" color="#d4a5b8" style={styles.loader} />
                  ) : courses.length > 0 ? (
                    <View style={styles.courseGrid}>
                      {courses.map((course) => (
                        <TouchableOpacity
                          key={course.id}
                          style={[
                            styles.courseButton,
                            formData.course === course.code && styles.courseButtonActive,
                          ]}
                          onPress={() => setFormData({ ...formData, course: course.code })}
                        >
                          <Text
                            style={[
                              styles.courseButtonText,
                              formData.course === course.code && styles.courseButtonTextActive,
                            ]}
                          >
                            {course.code}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.errorText}>No courses available. Please check backend.</Text>
                  )}
                </View>

                {/* Year Level (Students Only) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Year Level *</Text>
                  <View style={styles.yearContainer}>
                    {[1, 2, 3, 4].map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.yearButton,
                          formData.year_level === year && styles.yearButtonActive,
                        ]}
                        onPress={() => setFormData({ ...formData, year_level: year })}
                      >
                        <Text
                          style={[
                            styles.yearButtonText,
                            formData.year_level === year && styles.yearButtonTextActive,
                          ]}
                        >
                          Year {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* Status Toggle */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Status</Text>
              <View style={styles.statusContainer}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    formData.is_active && styles.statusButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, is_active: true })}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      formData.is_active && styles.statusButtonTextActive,
                    ]}
                  >
                    Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    !formData.is_active && styles.statusButtonInactive,
                  ]}
                  onPress={() => setFormData({ ...formData, is_active: false })}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      !formData.is_active && styles.statusButtonTextInactive,
                    ]}
                  >
                    Inactive
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Info Note */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Note: Changing course or year level will automatically reassign subjects
              </Text>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Update User</Text>
              )}
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
    maxHeight: '85%',
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  readOnlyInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
  },
  readOnlyText: {
    fontSize: 15,
    color: '#666',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#d4a5b8',
    borderColor: '#d4a5b8',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  courseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  courseButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  courseButtonActive: {
    backgroundColor: '#a8c9a0',
    borderColor: '#a8c9a0',
  },
  courseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  courseButtonTextActive: {
    color: '#fff',
  },
  yearContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  yearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  yearButtonActive: {
    backgroundColor: '#a8c9a0',
    borderColor: '#a8c9a0',
  },
  yearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  yearButtonTextActive: {
    color: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  statusButtonInactive: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#155724',
  },
  statusButtonTextInactive: {
    color: '#721c24',
  },
  infoBox: {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#0066cc',
    lineHeight: 18,
  },
  loader: {
    paddingVertical: 12,
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#c33',
    fontSize: 13,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#d4a5b8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditUserModal;