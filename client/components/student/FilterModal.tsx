
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import api from '../../src/services/api';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: { genre: string; subject: string }) => void;
}

export default function FilterModal({ visible, onClose, onApply }: FilterModalProps) {
  const [genres, setGenres] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  useEffect(() => {
    if (visible) {
      loadFilters();
    }
  }, [visible]);

  const loadFilters = async () => {
    try {
      const [genreResponse, subjectResponse] = await Promise.all([
        api.get('/genres'),
        api.get('/subjects'),
      ]);
      setGenres([{ id: 'All', name: 'All' }, ...genreResponse.data.genres]);
      setSubjects([{ id: 'All', name: 'All' }, ...subjectResponse.data.subjects]);
    } catch (error) {
      console.log('Error loading filters:', error);
    }
  };

  const handleApply = () => {
    onApply({ genre: selectedGenre, subject: selectedSubject });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Books</Text>

          <Text style={styles.filterSectionTitle}>Genre</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
            {genres.map((genre) => (
              <TouchableOpacity
                key={genre.id}
                style={[
                  styles.filterOption,
                  selectedGenre === genre.name && styles.filterOptionSelected,
                ]}
                onPress={() => setSelectedGenre(genre.name)}
              >
                <Text style={styles.filterOptionText}>{genre.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterSectionTitle}>Subject</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
            {subjects.map((subject) => (
              <TouchableOpacity
                key={subject.id}
                style={[
                  styles.filterOption,
                  selectedSubject === subject.name && styles.filterOptionSelected,
                ]}
                onPress={() => setSelectedSubject(subject.name)}
              >
                <Text style={styles.filterOptionText}>{subject.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterScrollView: {
    marginBottom: 20,
  },
  filterOption: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterOptionSelected: {
    backgroundColor: '#a8c9a0',
  },
  filterOptionText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: 10,
    marginRight: 10,
  },
  applyButton: {
    padding: 10,
    backgroundColor: '#a8c9a0',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
  },
});
