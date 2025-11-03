import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import  api  from '../../src/services/api';
import { getUserData, saveUserData } from '../../src/utils/storage';

export default function FirstTimeSetup() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: change password, 2: select genres
  
  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Genre selection state
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [genresLoading, setGenresLoading] = useState(false);

  useEffect(() => {
    checkFirstLogin();
  }, []);

  useEffect(() => {
    if (step === 2) {
      loadGenres();
    }
  }, [step]);

  const checkFirstLogin = async () => {
    const userData = await getUserData();
    if (!userData?.is_first_login) {
      // Not first login, redirect to home
      router.replace('/student/home');
    }
  };

  const loadGenres = async () => {
    try {
      const response = await api.get('/genres');
      setGenres(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load genres');
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      Alert.alert('Success', 'Password changed successfully');
      setStep(2);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggleGenre = (genreId: number) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      if (selectedGenres.length < 5) {
        setSelectedGenres([...selectedGenres, genreId]);
      } else {
        Alert.alert('Maximum Reached', 'You can select up to 5 genres only');
      }
    }
  };

  const handleGenreSubmit = async () => {
    if (selectedGenres.length < 3) {
      Alert.alert('Error', 'Please select at least 3 genres');
      return;
    }

    setGenresLoading(true);
    try {
      const response = await api.post('/genres/my-genres', {
        genreIds: selectedGenres
      });
      
      // Update stored user data to reflect completion
      const userData = await getUserData();
      await saveUserData({
        ...userData,
        needs_genre_selection: false
      });
      
      Alert.alert('Success', 'Preferences saved! Welcome to BiblioTech', [
        {
          text: 'OK',
          onPress: () => router.replace('/student/home')
        }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save preferences');
    } finally {
      setGenresLoading(false);
    }
  };

  if (step === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome to BiblioTech!</Text>
          <Text style={styles.headerSubtitle}>Please change your default password</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
              placeholder="Enter current password"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Enter new password (min. 6 characters)"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Confirm new password"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, passwordLoading && styles.buttonDisabled]}
            onPress={handlePasswordChange}
            disabled={passwordLoading}
          >
            <Text style={styles.buttonText}>
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Your Preferences</Text>
        <Text style={styles.headerSubtitle}>
          Choose at least 3 genres you're interested in ({selectedGenres.length} selected)
        </Text>
      </View>

      <ScrollView style={styles.genreScroll} contentContainerStyle={styles.genreContainer}>
        {genres.map((genre) => {
          const isSelected = selectedGenres.includes(genre.id);
          return (
            <TouchableOpacity
              key={genre.id}
              style={[
                styles.genreCard,
                isSelected && styles.genreCardSelected,
                { borderColor: isSelected ? genre.color : 'transparent' }
              ]}
              onPress={() => toggleGenre(genre.id)}
            >
              <Text style={styles.genreIcon}>{genre.icon}</Text>
              <Text style={styles.genreName}>{genre.name}</Text>
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: genre.color }]}>
                  <Check size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            (selectedGenres.length < 3 || genresLoading) && styles.buttonDisabled
          ]}
          onPress={handleGenreSubmit}
          disabled={selectedGenres.length < 3 || genresLoading}
        >
          <Text style={styles.buttonText}>
            {genresLoading ? 'Saving...' : 'Continue'}
          </Text>
        </TouchableOpacity>
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
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#d4a5b8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  genreScroll: {
    flex: 1,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  genreCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
    marginBottom: 12,
  },
  genreCardSelected: {
    borderWidth: 2,
  },
  genreIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  genreName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});