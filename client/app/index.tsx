import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authAPI } from '../src/services/api';
import { storeToken, storeUserData } from '../src/utils/storage';

export default function LoginScreen() {
  const router = useRouter();
  const [userType, setUserType] = useState<'admin' | 'student'>('student');
  const [schoolId, setSchoolId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!schoolId.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both School ID and Password');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(schoolId, password, userType);
      const { token, user } = response.data;

      // Check if user role matches selected type
      if (user.role !== userType) {
        Alert.alert(
          'Invalid Role',
          `This account is registered as ${user.role}, not ${userType}. Please select the correct role.`
        );
        setLoading(false);
        return;
      }

      // Store token and user data
      await storeToken(token);
      await storeUserData(user);

      // Navigate based on role and setup status
      if (user.role === 'admin') {
        router.replace('/admin/home');
      } else {
        // Student user - check if they need first-time setup
        if (user.is_first_login || user.needs_genre_selection) {
          router.replace('/student/first-time-setup');
        } else {
          router.replace('/student/home');
        }
      }

    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >

      <View style={styles.content}>

        {/* Logo */}
        <Text style={styles.logo}>
          <Text style={styles.logoBlack}>Biblio</Text>
          <Text style={styles.logoGray}>Tech</Text>
          <Text style={styles.logoDot}>.</Text>
        </Text>

        {/* Role Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              userType === 'admin' && styles.toggleButtonActive,
            ]}
            onPress={() => setUserType('admin')}
          >
            <Text
              style={[
                styles.toggleText,
                userType === 'admin' && styles.toggleTextActive,
              ]}
            >
              Admin
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              styles.toggleButtonStudent,
              userType === 'student' && styles.toggleButtonActiveStudent,
            ]}
            onPress={() => setUserType('student')}
          >
            <Text
              style={[
                styles.toggleText,
                userType === 'student' && styles.toggleTextActiveStudent,
              ]}
            >
              Student
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your ID"
            value={schoolId}
            onChangeText={setSchoolId}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>login</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  toggleButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#d0d0d0',
    backgroundColor: '#fff',
  },
  toggleButtonStudent: {
    borderColor: '#a8c9a0',
  },
  toggleButtonActive: {
    backgroundColor: '#a8c9a0',
    borderColor: '#a8c9a0',
  },
  toggleButtonActiveStudent: {
    backgroundColor: '#a8c9a0',
    borderColor: '#a8c9a0',
  },
  toggleText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#fff',
  },
  toggleTextActiveStudent: {
    color: '#fff',
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  logoBlack: {
    color: '#000',
  },
  logoGray: {
    color: '#666',
  },
  logoDot: {
    color: '#000',
  },
  formContainer: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#d4a5b8',
    paddingHorizontal: 50,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});