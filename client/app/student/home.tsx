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
import { usersAPI } from '../../src/services/api';
import FilterModal from '../../components/student/FilterModal';
import UserNavBar from '../../components/student/UserNavBar';

const BookRow = ({ title, books, onViewAll, router }) => (

  <View style={styles.section}>

    <View style={styles.sectionHeader}>

      <Text style={styles.sectionTitle}>{title}</Text>

      <TouchableOpacity onPress={onViewAll}>

        <Text style={styles.seeAllText}>See All</Text>

      </TouchableOpacity>

    </View>

    <ScrollView 

      horizontal 

      showsHorizontalScrollIndicator={false}

      contentContainerStyle={styles.booksScroll}

    >

      {books.length > 0 ? (

        books.map((book) => (

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

          <Text style={styles.emptyText}>No books to recommend in this category.</Text>

        </View>

      )}

    </ScrollView>

  </View>

);



export default function StudentHomeScreen() {

  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);

  const [allBooks, setAllBooks] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);

  const [filters, setFilters] = useState<{ genre: string; subject: string }> ({

    genre: 'All',

    subject: 'All',

  });

  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);

  const [subjectBooks, setSubjectBooks] = useState<any[]>([]);

  const [genreBooks, setGenreBooks] = useState<any[]>([]);



  useEffect(() => {

    loadUserData();

    loadBooks();

  }, []);



  useEffect(() => {

    let books = allBooks;



    if (filters.genre !== 'All' || filters.subject !== 'All') {

      if (filters.genre !== 'All') {

        books = books.filter((book) => book.genre_names?.includes(filters.genre));

      }



      if (filters.subject !== 'All') {

        books = books.filter((book) => book.subject_names?.includes(filters.subject));

      }

      setFilteredBooks(books);

    } else {

      // When no filters are active, populate the recommendation rows

      const userSubjects = userData?.subjects?.map(s => s.name) || [];

      const userGenres = userData?.genres?.map(g => g.name) || [];



      setSubjectBooks(allBooks.filter(book => userSubjects.some(s => book.subject_names?.includes(s))));

      setGenreBooks(allBooks.filter(book => userGenres.some(g => book.genre_names?.includes(g))));

      setFilteredBooks(allBooks); // Show all books in the main list

    }

  }, [allBooks, filters, userData]);



    const loadUserData = async () => {



      try {



        const token = await getUserData(); // This now gets the whole user data object, which includes the token



        if (token) {



          const data = await usersAPI.getUserProfile();



          setUserData(data.data);



        } else {



          // Handle case where there is no token (user not logged in)



          setUserData(null);



        }



      } catch (error) {



        console.log('Error loading user data:', error);



      }



    };





  const loadBooks = async () => {

    try {

      const response = await api.get('/books');

      const books = Array.isArray(response.data)

        ? response.data

        : response.data.books || response.data.data || [];



      setAllBooks(books);



    } catch (error) {

      console.log('Error loading data:', error);

      setAllBooks([]);

    } finally {

      setLoading(false);

    }

  };





  const handleLogout = async () => {

    await removeToken();

    router.replace('/');

  };



  const handleApplyFilter = (newFilters: { genre: string; subject: string }) => {

    setFilters(newFilters);

  };



  const handleViewAll = (title: string, books: any[]) => {

    router.push({

      pathname: '/student/BookListScreen',

      params: { title, books: JSON.stringify(books) },

    } as any);

  };



  const renderContent = () => {

    if (loading) {

      return <Text style={styles.loadingText}>Loading...</Text>;

    }



    if (filters.genre !== 'All' || filters.subject !== 'All') {

      return (

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>Filtered Results</Text>

          <View style={styles.bookGrid}>

            {filteredBooks.length > 0 ? (

              filteredBooks.map((book) => (

                <TouchableOpacity 

                  key={book.id}

                  style={styles.bookCardVertical}

                  onPress={() => router.push(`/student/book-view/${book.id}` as any)}

                >

                  {book.cover_image_url ? (

                    <Image 

                      source={{ uri: book.cover_image_url }}

                      style={styles.bookCoverImageVertical}

                    />

                  ) : (

                    <View style={styles.bookCoverVertical}>

                      <Text style={styles.bookCoverText}>{book.title.charAt(0)}</Text>

                    </View>

                  )}

                  <Text style={styles.bookTitleVertical} numberOfLines={2}>{book.title}</Text>

                  <Text style={styles.bookAuthorVertical} numberOfLines={1}>{book.author}</Text>

                </TouchableOpacity>

              ))

            ) : (

              <View style={styles.emptyState}>

                <Text style={styles.emptyText}>No books match your filter.</Text>

              </View>

            )}

          </View>

        </View>

      );

    }



        return (



          <>



            <BookRow title="For You (Subjects)" books={subjectBooks} onViewAll={() => handleViewAll('For You (Subjects)', subjectBooks)} router={router} />



            <BookRow title="For You (Genres)" books={genreBooks} onViewAll={() => handleViewAll('For You (Genres)', genreBooks)} router={router} />



            <BookRow title="All Books" books={allBooks} onViewAll={() => handleViewAll('All Books', allBooks)} router={router} />



          </>



        );



      };



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

            <TouchableOpacity 

              style={styles.filterButton}

              onPress={() => setModalVisible(true)}

            >

              <Text style={styles.filterText}>Filter</Text>

            </TouchableOpacity>

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

        </View>



        {renderContent()}



      </ScrollView>



      <FilterModal

        visible={modalVisible}

        onClose={() => setModalVisible(false)}

        onApply={handleApplyFilter}

      />



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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookCardVertical: {
    width: '48%',
    marginBottom: 20,
  },
  bookCoverVertical: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookCoverImageVertical: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookTitleVertical: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  bookAuthorVertical: {
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