import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  ActivityIndicator,
  Image,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, QrCode } from 'lucide-react-native';
import { usersAPI, booksAPI } from '../../src/services/api';

// Define types for our data
interface Tag {
  id: number;
  name: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  cover_image_url: string;
  status: string;
}

// A simple local component for displaying a book item
const BookItem = ({ item, router }: { item: Book, router: any }) => (
  <TouchableOpacity style={styles.bookItem} onPress={() => router.push(`/student/book-view/${item.id}` as any)}>
    <Image source={{ uri: item.cover_image_url || 'https://via.placeholder.com/80x120.png?text=No+Image' }} style={styles.bookCover} />
    <View style={styles.bookInfo}>
      <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.bookAuthor}>{item.author}</Text>
      <Text style={[
        styles.bookStatus,
        { color: item.status === 'available' ? '#28a745' : '#dc3545' }
      ]}>
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </Text>
    </View>
  </TouchableOpacity>
);


export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [tags, setTags] = useState<{ subjects: Tag[], genres: Tag[] }>({ subjects: [], genres: [] });
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's preferred subjects and genres for tags
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await usersAPI.getMyPreferences();
        setTags({
          subjects: res.data.subjects || [],
          genres: res.data.genres || []
        });
      } catch (err) {
        console.error('Failed to fetch preferences:', err);
      }
    };
    fetchPreferences();
  }, []);

  // Debounced search handler
  const handleSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await booksAPI.searchBooks(query.trim());
      setSearchResults(res.data.books || []);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to fetch books. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onTagPress = (tagName: string) => {
    setSearchQuery(tagName);
    handleSearch(tagName);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Books</Text>
        <TouchableOpacity onPress={() => router.push('/student/qr-scanner')}>
          <QrCode size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, author, ISBN..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
          returnKeyType="search"
        />
      </View>

      {/* Suggested Tags */}
      <View style={styles.tagsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tags.subjects.map(tag => (
            <TouchableOpacity key={`sub-${tag.id}`} style={styles.tag} onPress={() => onTagPress(tag.name)}>
              <Text style={styles.tagText}>{tag.name}</Text>
            </TouchableOpacity>
          ))}
          {tags.genres.map(tag => (
            <TouchableOpacity key={`gen-${tag.id}`} style={styles.tag} onPress={() => onTagPress(tag.name)}>
              <Text style={styles.tagText}>{tag.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
        ) : error ? (
          <View style={styles.placeholder}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={({ item }) => <BookItem item={item} router={router} />}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 150 }}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Find Your Next Read</Text>
            <Text style={styles.placeholderSubtext}>Search for books or use the suggested tags.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 15,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  tagsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  tag: {
    backgroundColor: '#e9ecef',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  tagText: {
    color: '#495057',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50, // Adjust to center vertically
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#888',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
  },
  // Book Item styles
  bookItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 4,
    marginRight: 15,
    backgroundColor: '#eee',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  bookStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});