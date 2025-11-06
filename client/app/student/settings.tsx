import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { usersAPI, genresAPI, subjectsAPI } from '@/src/services/api';

export default function SettingsScreen() {
  const router = useRouter();
  const [allSubjects, setAllSubjects] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenreCountValid, setIsGenreCountValid] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [subjectsRes, genresRes, prefsRes] = await Promise.all([
          subjectsAPI.getAllSubjects(),
          genresAPI.getAllGenres(),
          usersAPI.getMyPreferences(),
        ]);

        setAllSubjects(subjectsRes.data.subjects || []);
        setAllGenres(genresRes.data.genres || []);

        const initialSelectedSubjects = prefsRes.data.subjects?.map((s: any) => s.id) || [];
        const initialSelectedGenres = prefsRes.data.genres?.map((g: any) => g.id) || [];

        setSelectedSubjects(initialSelectedSubjects);
        setSelectedGenres(initialSelectedGenres);
        setIsGenreCountValid(initialSelectedGenres.length >= 3 && initialSelectedGenres.length <= 5);
      } catch (error) {
        console.error('Failed to fetch settings data:', error);
        Alert.alert('Error', 'Failed to load your preferences.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsGenreCountValid(selectedGenres.length >= 3 && selectedGenres.length <= 5);
  }, [selectedGenres]);

  const handleToggle = (id: number, type: 'subject' | 'genre') => {
    if (type === 'subject') {
      setSelectedSubjects(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      setSelectedGenres(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    }
  };

  const handleSaveChanges = async () => {
    if (!isGenreCountValid) {
      Alert.alert('Invalid Selection', 'You must select between 3 and 5 genres.');
      return;
    }

    try {
      setIsSaving(true);
      await Promise.all([
        subjectsAPI.setMySubjects(selectedSubjects),
        genresAPI.setMyGenres(selectedGenres),
      ]);
      Alert.alert('Success', 'Your preferences have been updated.');
      router.back();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderItem = (item: any, type: 'subject' | 'genre') => {
    const isSelected = type === 'subject'
      ? selectedSubjects.includes(item.id)
      : selectedGenres.includes(item.id);

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.item, isSelected && styles.itemSelected]}
        onPress={() => handleToggle(item.id, type)}
      >
        <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Preferences</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Subjects</Text>
          <View style={styles.itemsContainer}>
            {allSubjects.map(item => renderItem(item, 'subject'))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Genres</Text>
          <Text style={styles.sectionSubtitle}>Select 3 to 5 genres that you are interested in.</Text>
          <View style={styles.itemsContainer}>
            {allGenres.map(item => renderItem(item, 'genre'))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (isSaving || !isGenreCountValid) && styles.saveButtonDisabled]}
          onPress={handleSaveChanges}
          disabled={isSaving || !isGenreCountValid}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
        {!isGenreCountValid && (
          <Text style={styles.errorText}>
            Please select between 3 and 5 genres.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemSelected: {
    backgroundColor: '#a8c9a0',
    borderColor: '#a8c9a0',
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },
  itemTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#d4a5b8',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
  },
});