import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import api from '../../src/services/api';
import AdminNavBar from '../../components/admin/AdminNavBar';
import SearchBar from '../../components/admin/SearchBar';
import StatusFilter from '../../components/admin/StatusFilter';
import BookCard from '../../components/admin/BookCard';
import CreateBookModal from '../../components/admin/CreateBookModal';
import EditBookModal from '../../components/admin/EditBookModal';
import ViewBookModal from '../../components/admin/ViewBookModal';

interface Book {
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
  genre_names?: string;
  subject_names?: string;
}

type StatusFilter = 'all' | 'available' | 'borrowed' | 'reserved' | 'maintenance';

export default function BooksManagementScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewBookId, setViewBookId] = useState<number | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchQuery, statusFilter, books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/books', {
        params: { limit: 1000 }
      });
      setBooks(response.data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      Alert.alert('Error', 'Failed to load books');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBooks();
  }, []);

  const filterBooks = () => {
    let filtered = [...books];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((book) => book.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.isbn?.toLowerCase().includes(query) ||
          book.shelf_location.toLowerCase().includes(query) ||
          book.qr_code.toLowerCase().includes(query)
      );
    }

    setFilteredBooks(filtered);
  };

  const handleView = (book: Book) => {
    setViewBookId(book.id);
    setViewModalVisible(true);
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setEditModalVisible(true);
  };

  const handleDelete = (book: Book) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${book.title}"?${
        book.status === 'borrowed'
          ? '\n\n⚠️ Warning: This book is currently borrowed!'
          : ''
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/books/${book.id}`);
              Alert.alert('Success', 'Book deleted successfully');
              fetchBooks();
            } catch (error: any) {
              console.error('Delete error:', error);
              Alert.alert(
                'Error',
                error.response?.data?.error || 'Failed to delete book'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header - matching account management */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Books Management</Text>
          
          <TouchableOpacity 
            onPress={() => setCreateModalVisible(true)}
            style={styles.addButton}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by title, author, ISBN, QR, or shelf..."
          />
        </View>

        {/* Status Filter */}
        <View style={styles.filterContainer}>
          <StatusFilter
            selectedStatus={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </View>

        {/* Results Header - matching account management */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} found
          </Text>
          <Text style={styles.statsText}>
            {books.filter((b) => b.status === 'available').length} available • {' '}
            {books.filter((b) => b.status === 'borrowed').length} borrowed
          </Text>
        </View>

        {/* Books List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d4a5b8" />
            <Text style={styles.loadingText}>Loading books...</Text>
          </View>
        ) : filteredBooks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No books found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first book to get started'}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Modals */}
      <CreateBookModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={fetchBooks}
      />

      <EditBookModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedBook(null);
        }}
        onSuccess={fetchBooks}
        book={selectedBook}
      />

      <ViewBookModal
        visible={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setViewBookId(null);
        }}
        bookId={viewBookId}
        isAdmin={true}
        onBookReturned={fetchBooks} 
      />

      {/* Bottom Navigation */}
      <AdminNavBar currentPage="book" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#d4a5b8',
    padding: 10,
    borderRadius: 12,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  statsText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});