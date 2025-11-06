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

interface EditBookModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  book: {
    id: number;
    title: string;
    author: string;
    isbn?: string;
    qr_code: string;
    publication_year?: number;
    publisher?: string;
    pages?: number;
    synopsis?: string;
    shelf_location: string;
    status: string;
    current_borrower_id?: number;
  } | null;
}

interface Genre {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface Subject {
  id: number;
  code: string;
  name: string;
  category: string;
}

const EditBookModal: React.FC<EditBookModalProps> = ({ visible, onClose, onSuccess, book }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publication_year: '',
    publisher: '',
    pages: '',
    synopsis: '',
    shelf_location: '',
    genre_ids: [] as number[],
    subject_ids: [] as number[],
  });

  const [genres, setGenres] = useState<Genre[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [bookGenres, setBookGenres] = useState<Genre[]>([]);
  const [bookSubjects, setBookSubjects] = useState<Subject[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible && book) {
      fetchGenres();
      fetchSubjects();
      fetchBookGenres();
      fetchBookSubjects();
      
      // Pre-fill form with book data
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        publication_year: book.publication_year ? String(book.publication_year) : '',
        publisher: book.publisher || '',
        pages: book.pages ? String(book.pages) : '',
        synopsis: book.synopsis || '',
        shelf_location: book.shelf_location || '',
        genre_ids: [],
        subject_ids: [],
      });
    }
  }, [visible, book]);

  const fetchGenres = async () => {
  try {
    setLoadingGenres(true);
    const response = await api.get('/genres');
    setGenres(response.data.genres || response.data || []);
  } catch (err) {
    setError('Failed to load genres');
  } finally {
    setLoadingGenres(false);
  }
};

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await api.get('/subjects');
      setSubjects(response.data.subjects || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchBookGenres = async () => {
    if (!book) return;
    try {
      const response = await api.get(`/books/${book.id}/genres`);
      const fetchedGenres = response.data.genres || [];
      setBookGenres(fetchedGenres);
      setFormData(prev => ({
        ...prev,
        genre_ids: fetchedGenres.map((g: Genre) => g.id)
      }));
    } catch (err) {
      console.error('Error fetching book genres:', err);
    }
  };

  const fetchBookSubjects = async () => {
    if (!book) return;
    try {
      const response = await api.get(`/books/${book.id}/subjects`);
      const fetchedSubjects = response.data.subjects || [];
      setBookSubjects(fetchedSubjects);
      setFormData(prev => ({
        ...prev,
        subject_ids: fetchedSubjects.map((s: Subject) => s.id)
      }));
    } catch (err) {
      console.error('Error fetching book subjects:', err);
    }
  };

  const toggleGenre = (genreId: number) => {
    setFormData(prev => ({
      ...prev,
      genre_ids: prev.genre_ids.includes(genreId)
        ? prev.genre_ids.filter(id => id !== genreId)
        : [...prev.genre_ids, genreId]
    }));
  };

  const toggleSubject = (subjectId: number) => {
    setFormData(prev => ({
      ...prev,
      subject_ids: prev.subject_ids.includes(subjectId)
        ? prev.subject_ids.filter(id => id !== subjectId)
        : [...prev.subject_ids, subjectId]
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.author.trim()) {
      setError('Author is required');
      return;
    }

    if (!formData.shelf_location.trim()) {
      setError('Shelf location is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updateData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn.trim() || null,
        publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
        publisher: formData.publisher.trim() || null,
        pages: formData.pages ? parseInt(formData.pages) : null,
        synopsis: formData.synopsis.trim() || null,
        shelf_location: formData.shelf_location.trim(),
        genre_ids: formData.genre_ids,
        subject_ids: formData.subject_ids,
      };

      await api.put(`/books/${book?.id}`, updateData);

      Alert.alert('Success', 'Book updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            onSuccess();
            onClose();
          },
        },
      ]);
    } catch (err: any) {
      console.error('Update book error:', err);
      setError(err.response?.data?.error || 'Failed to update book');
    } finally {
      setLoading(false);
    }
  };

  if (!book) return null;

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
            <Text style={styles.modalTitle}>Edit Book</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* QR Code (Read-only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>QR Code</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>{book.qr_code}</Text>
              </View>
              <Text style={styles.helperText}>QR code cannot be changed</Text>
            </View>

            {/* Status (Read-only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={[
                styles.readOnlyInput,
                book.status === 'available' && styles.statusAvailable,
                book.status === 'borrowed' && styles.statusBorrowed,
                book.status === 'reserved' && styles.statusReserved,
              ]}>
                <Text style={[
                  styles.readOnlyText,
                  book.status === 'available' && styles.statusTextAvailable,
                  book.status === 'borrowed' && styles.statusTextBorrowed,
                  book.status === 'reserved' && styles.statusTextReserved,
                ]}>
                  {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                </Text>
              </View>
              <Text style={styles.helperText}>Status is managed by the borrow system</Text>
            </View>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter book title"
                placeholderTextColor="#999"
              />
            </View>

            {/* Author */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Author *</Text>
              <TextInput
                style={styles.input}
                value={formData.author}
                onChangeText={(text) => setFormData({ ...formData, author: text })}
                placeholder="Enter author name"
                placeholderTextColor="#999"
              />
            </View>

            {/* ISBN */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ISBN</Text>
              <TextInput
                style={styles.input}
                value={formData.isbn}
                onChangeText={(text) => setFormData({ ...formData, isbn: text })}
                placeholder="Enter ISBN (optional)"
                placeholderTextColor="#999"
              />
            </View>

            {/* Shelf Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shelf Location *</Text>
              <TextInput
                style={styles.input}
                value={formData.shelf_location}
                onChangeText={(text) => setFormData({ ...formData, shelf_location: text })}
                placeholder="e.g., A-101, Shelf B-3"
                placeholderTextColor="#999"
              />
            </View>

            {/* Publication Year */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Publication Year</Text>
              <TextInput
                style={styles.input}
                value={formData.publication_year}
                onChangeText={(text) => setFormData({ ...formData, publication_year: text })}
                placeholder="e.g., 2024"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {/* Publisher */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Publisher</Text>
              <TextInput
                style={styles.input}
                value={formData.publisher}
                onChangeText={(text) => setFormData({ ...formData, publisher: text })}
                placeholder="Enter publisher name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Pages */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pages</Text>
              <TextInput
                style={styles.input}
                value={formData.pages}
                onChangeText={(text) => setFormData({ ...formData, pages: text })}
                placeholder="Number of pages"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {/* Synopsis */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Synopsis</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.synopsis}
                onChangeText={(text) => setFormData({ ...formData, synopsis: text })}
                placeholder="Enter book synopsis or description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Genres */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Genres (Select multiple)</Text>
              {loadingGenres ? (
                <ActivityIndicator size="small" color="#d4a5b8" style={styles.loader} />
              ) : genres.length > 0 ? (
                <View style={styles.chipContainer}>
                  {genres.map((genre) => (
                    <TouchableOpacity
                      key={genre.id}
                      style={[
                        styles.chip,
                        formData.genre_ids.includes(genre.id) && styles.chipActive,
                      ]}
                      onPress={() => toggleGenre(genre.id)}
                    >
                      <Text style={styles.chipIcon}>{genre.icon}</Text>
                      <Text
                        style={[
                          styles.chipText,
                          formData.genre_ids.includes(genre.id) && styles.chipTextActive,
                        ]}
                      >
                        {genre.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.errorText}>No genres available</Text>
              )}
            </View>

            {/* Subjects */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subjects (Select multiple)</Text>
              {loadingSubjects ? (
                <ActivityIndicator size="small" color="#d4a5b8" style={styles.loader} />
              ) : subjects.length > 0 ? (
                <View style={styles.chipContainer}>
                  {subjects.map((subject) => (
                    <TouchableOpacity
                      key={subject.id}
                      style={[
                        styles.chip,
                        formData.subject_ids.includes(subject.id) && styles.chipActive,
                      ]}
                      onPress={() => toggleSubject(subject.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          formData.subject_ids.includes(subject.id) && styles.chipTextActive,
                        ]}
                      >
                        {subject.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.errorText}>No subjects available</Text>
              )}
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
                <Text style={styles.submitButtonText}>Update Book</Text>
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
    maxHeight: '90%',
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
  textArea: {
    minHeight: 100,
    paddingTop: 12,
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
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  statusAvailable: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  statusBorrowed: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  statusReserved: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
  },
  statusTextAvailable: {
    color: '#155724',
  },
  statusTextBorrowed: {
    color: '#721c24',
  },
  statusTextReserved: {
    color: '#856404',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    gap: 4,
  },
  chipActive: {
    backgroundColor: '#d4a5b8',
    borderColor: '#d4a5b8',
  },
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  chipTextActive: {
    color: '#fff',
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

export default EditBookModal;