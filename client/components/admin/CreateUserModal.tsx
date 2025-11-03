// Modal for creating new users (Admin only)
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import api from '../../src/services/api';

interface CreateUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Course {
  id: number;
  code: string;
  name: string;
}

export default function CreateUserModal({ visible, onClose, onSuccess }: CreateUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    school_id: '',
    name: '',
    email: '',
    role: 'student',
    course: '',
    year_level: '',
  });

  // Fetch courses on mount
  useEffect(() => {
    if (visible) {
      fetchCourses();
    }
  }, [visible]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/subjects/courses');
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.school_id.trim()) {
      Alert.alert('Validation Error', 'School ID is required');
      return false;
    }
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email');
      return false;
    }
    if (formData.role === 'student' && !formData.course) {
      Alert.alert('Validation Error', 'Course is required for students');
      return false;
    }
    if (formData.role === 'student' && !formData.year_level) {
      Alert.alert('Validation Error', 'Year level is required for students');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Prepare data
      const userData = {
        school_id: formData.school_id.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        course: formData.course || null,
        year_level: formData.year_level ? parseInt(formData.year_level) : null,
      };

      const response = await api.post('/users', userData);
      
      Alert.alert(
        'Success!',
        `User created successfully!\n\nTemporary Password: ${response.data.tempPassword}\n\nPlease share this with the user.`,
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
              onSuccess();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Create user error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to create user'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      school_id: '',
      name: '',
      email: '',
      role: 'student',
      course: '',
      year_level: '',
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create New User</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* School ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>School ID *</Text>
              <TextInput
                style={styles.input}
                value={formData.school_id}
                onChangeText={(text) => handleInputChange('school_id', text)}
                placeholder="e.g., 2024-00001"
                autoCapitalize="none"
              />
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Juan Dela Cruz"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                placeholder="juan@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Role */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Role *</Text>
              <View style={styles.roleButtons}>
                {['student', /*'teacher' ,*/ 'admin'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      formData.role === role && styles.roleButtonActive,
                    ]}
                    onPress={() => handleInputChange('role', role)}
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

            {/* Course (for students) */}
            {formData.role === 'student' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Course *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.courseButtons}>
                      {courses.map((course) => (
                        <TouchableOpacity
                          key={course.id}
                          style={[
                            styles.courseButton,
                            formData.course === course.code && styles.courseButtonActive,
                          ]}
                          onPress={() => handleInputChange('course', course.code)}
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
                  </ScrollView>
                </View>

                {/* Year Level */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Year Level *</Text>
                  <View style={styles.yearButtons}>
                    {[1, 2, 3, 4].map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.yearButton,
                          formData.year_level === String(year) && styles.yearButtonActive,
                        ]}
                        onPress={() => handleInputChange('year_level', String(year))}
                      >
                        <Text
                          style={[
                            styles.yearButtonText,
                            formData.year_level === String(year) && styles.yearButtonTextActive,
                          ]}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

            
              </>
            )}

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ℹ️ A temporary password will be generated automatically.
                {formData.role === 'student' && formData.course && formData.year_level && 
                  '\n\n✅ Subjects will be auto-assigned based on course and year level.'}
              </Text>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
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
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Create User</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    //maxHeight: '85%',
    height: 600,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
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
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#d4a5b8',
    backgroundColor: '#d4a5b8',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  courseButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  courseButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  courseButtonActive: {
    borderColor: '#a8c9a0',
    backgroundColor: '#a8c9a0',
  },
  courseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  courseButtonTextActive: {
    color: '#fff',
  },
  yearButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  yearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  yearButtonActive: {
    borderColor: '#d4a5b8',
    backgroundColor: '#d4a5b8',
  },
  yearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  yearButtonTextActive: {
    color: '#fff',
  },
  infoBox: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    marginTop: 8,
    paddingBottom: 30,
  },
  infoText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#d4a5b8',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});