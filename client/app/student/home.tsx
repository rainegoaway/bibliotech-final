import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Bell, 
  LogOut, 
  Search, 
  QrCode, 
  Settings,
  BookOpen,
  Clock
} from 'lucide-react-native';
import { getUserData, removeToken } from '../../src/utils/storage';
import api from '../../src/services/api';
import GenreTabs from '../../components/student/GenreTabs';
import UserNavBar from '../../components/student/UserNavBar';

export default function StudentHomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [userGenres, setUserGenres] = useState<any[]>([]);
  const [allGenres, setAllGenres] = useState<any[]>([]);

  useEffect(() => {
    loadUserData();
    loadBooks();
  }, []);

  const loadUserData = async () => {
    const data = await getUserData();
    setUserData(data);
  };


  const loadBooks = async () => {
    try {
      const response = await api.get('/books');
      const books = Array.isArray(response.data)
        ? response.data
        : response.data.books || response.data.data || [];

      setAllBooks(books);

      // ✅ Load all genres from API
      const genreResponse = await api.get('/genres');
      setAllGenres(genreResponse.data.genres || genreResponse.data || []);

    } catch (error) {
      console.log('Error loading data:', error);
      setAllBooks([]);
      setAllGenres([]);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    await removeToken();
    router.replace('/');
  };

  // Re-introduced getFilteredBooks, now only dependent on selectedGenre
  const getFilteredBooks = () => {
    if (selectedGenre === 'All') {
      return allBooks;
    }
    return allBooks.filter(book => book.genre === selectedGenre);
  };

  const filteredBooks = getFilteredBooks(); // filteredBooks is now correctly defined

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userData?.name?.charAt(0) || 'S'}
            </Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userData?.name?.split(' ')[0] || 'Student'} !</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleLogout}
          >
            <LogOut size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      

      {/* Main Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            {/*
             <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => }
            >
              <Text style={styles.filterText}>filter</Text>
            </TouchableOpacity> 
            */}
            <TouchableOpacity 
              style={styles.searchInputContainer}
              onPress={() => router.push('/student/search' as any)}
            >
              <Search size={20} color="#999" />
              <Text style={styles.searchPlaceholderText}>Search by title, author, ISBN...</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.qrButton}
              onPress={() => router.push('/student/qr-scanner')}
            >
              <QrCode size={28} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Genre Tabs */}
            <GenreTabs
              allGenres={allGenres}
              selectedGenre={selectedGenre}
              onSelectGenre={setSelectedGenre}
            />


        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Books</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.booksScroll}
          >
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <TouchableOpacity 
                  key={book.id}
                  style={styles.bookCard}
                  onPress={() => router.push(`/student/book-view/${book.id}` as any)}
                >
                  {book.cover_image_url ? (
                    <Image 
                      source={{ uri: book.cover_image_url }}
                      style={styles.bookCoverImage}
                    />
                  ) : (
                    <View style={styles.bookCover}>
                      <Text style={styles.bookCoverText}>{book.title.charAt(0)}</Text>
                    </View>
                  )}
                  <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
                  <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No books available</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <UserNavBar />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#a8c9a0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d4a5b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
    height: 44,
  },
  searchPlaceholderText: {
    fontSize: 16,
    color: '#999',
    flex: 1,
  },
  qrButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  categoryTabs: {
    marginTop: 16,
    gap: 16,
  },
  categoryTab: {
    paddingBottom: 4,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  categoryTabTextInactive: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  booksScroll: {
    gap: 16,
    paddingRight: 20,
  },
  bookCard: {
    width: 120,
  },
  bookCover: {
    width: 120,
    height: 160,
    backgroundColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookCoverText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#666',
  },
  bookCoverImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    paddingVertical: 40,
  },
});