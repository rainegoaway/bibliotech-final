import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings, ArrowLeft, Calendar, Clock, Book, RefreshCw, AlertCircle } from 'lucide-react-native';
import UserNavBar from '@/components/student/UserNavBar';
import { borrowsAPI, usersAPI, reservationsAPI } from '../../src/services/api';
import { useFocusEffect } from 'expo-router';

// ===============================================
// Type Definitions
// ===============================================

interface Subject {
  id: number;
  code: string;
  name: string;
}

interface Genre {
  id: number;
  name: string;
}

interface UserProfile {
  name: string;
  year_level: number;
  course: string;
  school_id: string;
  subjects: Subject[];
  genres: Genre[];
}

interface BookItem {
  id: number;
  book_id: number;
  title: string;
  author: string;
  cover_image_url?: string;
  due_date?: string;
  borrowed_date?: string;
  returned_date?: string;
  fine?: string | number;
  status?: 'pending' | 'ready';
  expires_at?: string;
}

// ===============================================
// Helper Functions
// ===============================================

// Helper to get ordinal suffix (1st, 2nd, 3rd)
const getOrdinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// ===============================================
// Sub-components for each tab
// ===============================================

interface EmptyStateProps {
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <View style={styles.emptyContainer}>
    <Book size={40} color="#a0a0a0" />
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

interface BorrowedBooksProps {
  books: BookItem[];
  onRenew: (borrowId: number) => void;
  onPress: (bookId: number) => void;
}

const BorrowedBooks: React.FC<BorrowedBooksProps> = ({ books, onRenew, onPress }) => {
  if (books.length === 0) {
    return <EmptyState message="You have no borrowed books." />;
  }

  return (
    <>
      {books.map((item) => {
        const isOverdue = item.due_date ? new Date(item.due_date) < new Date() : false;
        const fine = item.fine ? parseFloat(item.fine.toString()).toFixed(2) : '0.00';

        return (
          <TouchableOpacity key={item.id} style={styles.bookCard} onPress={() => onPress(item.book_id)}>
            <Image source={{ uri: item.cover_image_url || 'https://via.placeholder.com/80x120' }} style={styles.bookCover} />
            <View style={styles.bookDetails}>
              <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.bookAuthor}>by {item.author}</Text>
              <View style={styles.dateContainer}>
                <Calendar size={14} color={isOverdue ? '#c0392b' : '#555'} />
                <Text style={[styles.dateText, isOverdue && styles.overdueText]}>
                  Due: {formatDate(item.due_date)}
                </Text>
              </View>
              {isOverdue && (
                <View style={styles.overdueInfo}>
                  <AlertCircle size={14} color="#c0392b" />
                  <Text style={styles.overdueText}>Overdue! Fine: ₱{fine}</Text>
                </View>
              )}
            </View>
            {!isOverdue && (
              <TouchableOpacity style={styles.renewButton} onPress={() => onRenew(item.id)}>
                <RefreshCw size={18} color="#fff" />
                <Text style={styles.renewButtonText}>Renew</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      })}
    </>
  );
};

interface ReservedBooksProps {
  books: BookItem[];
  onCancel: (reservationId: number) => void;
  onPickup: (bookId: number) => void;
  onPress: (bookId: number) => void;
}

const ReservedBooks: React.FC<ReservedBooksProps> = ({ books, onCancel, onPickup, onPress }) => {
  if (books.length === 0) {
    return <EmptyState message="You have no reserved books." />;
  }

  return (
    <>
      {books.map((item) => (
        <TouchableOpacity key={item.id} style={styles.bookCard} onPress={() => onPress(item.book_id)}>
          <Image source={{ uri: item.cover_image_url || 'https://via.placeholder.com/80x120' }} style={styles.bookCover} />
          <View style={styles.bookDetails}>
            <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.bookAuthor}>by {item.author}</Text>
            {item.status === 'pending' && (
              <View style={[styles.statusBadge, { backgroundColor: '#f39c12' }]}>
                <Clock size={14} color="#fff" />
                <Text style={styles.statusBadgeText}>Waiting for return</Text>
              </View>
            )}
            {item.status === 'ready' && (
              <View style={[styles.statusBadge, { backgroundColor: '#2ecc71' }]}>
                <Text style={styles.statusBadgeText}>✅ Ready for Pickup!</Text>
              </View>
            )}
            {item.status === 'ready' && item.expires_at && (
              <View style={styles.dateContainer}>
                <Calendar size={14} color="#555" />
                <Text style={styles.dateText}>Claim before: {formatDate(item.expires_at)}</Text>
              </View>
            )}
          </View>
          <View style={styles.actionButtons}>
            {item.status === 'ready' ? (
              <TouchableOpacity style={[styles.actionButton, styles.pickupButton]} onPress={() => onPickup(item.book_id)}>
                <Text style={styles.actionButtonText}>Pick Up</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => onCancel(item.id)}>
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
};

interface HistoryBooksProps {
  books: BookItem[];
  onPress: (bookId: number) => void;
}

const HistoryBooks: React.FC<HistoryBooksProps> = ({ books, onPress }) => {
  if (books.length === 0) {
    return <EmptyState message="Your borrowing history is empty." />;
  }

  return (
    <>
      {books.map((item) => (
        <TouchableOpacity key={item.id} style={styles.bookCard} onPress={() => onPress(item.book_id)}>
          <Image source={{ uri: item.cover_image_url || 'https://via.placeholder.com/80x120' }} style={styles.bookCover} />
          <View style={styles.bookDetails}>
            <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.bookAuthor}>by {item.author}</Text>
            <View style={styles.dateContainer}>
              <Calendar size={14} color="#555" />
              <Text style={styles.dateText}>Borrowed: {formatDate(item.borrowed_date)}</Text>
            </View>
            <View style={styles.dateContainer}>
              <Clock size={14} color="#555" />
              <Text style={styles.dateText}>Returned: {formatDate(item.returned_date)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
};

// ===============================================
// Main Profile Screen Component
// ===============================================

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'borrowed' | 'reserved' | 'history'>('borrowed');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [borrowed, setBorrowed] = useState<BookItem[]>([]);
  const [reserved, setReserved] = useState<BookItem[]>([]);
  const [history, setHistory] = useState<BookItem[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, borrowedData, reservedData, historyData] = await Promise.all([
        usersAPI.getUserProfile(),
        borrowsAPI.getMyBorrows(),
        reservationsAPI.getMyReservations(),
        borrowsAPI.getBorrowHistory(),
      ]);

      setProfile(profileData.data);
      setBorrowed(borrowedData.data.borrows || []);
      setReserved(reservedData.data.reservations || []);
      setHistory(historyData.data.history || []);
    } catch (error: unknown) {
      console.error('Error loading profile data:', (error as any).response?.data || (error as Error).message);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  }, []);

  const handleRenew = async (borrowId: number) => {
    try {
      await borrowsAPI.renewBook(borrowId);
      Alert.alert('Success', 'Book renewed successfully');
      loadData();
    } catch (error: unknown) {
      Alert.alert('Error', (error as any).response?.data?.error || 'Failed to renew book');
    }
  };

  const handleCancelReservation = (reservationId: number) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await reservationsAPI.cancelReservation(reservationId);
              Alert.alert('Success', 'Reservation cancelled');
              loadData();
            } catch (error: unknown) {
              Alert.alert('Error', (error as any).response?.data?.error || 'Failed to cancel reservation');
            }
          },
        },
      ]
    );
  };

  const handlePickup = async (bookId: number) => {
    try {
      await borrowsAPI.borrowBook(bookId);
      Alert.alert('Success', 'Book picked up successfully! It is now in your borrowed list.');
      loadData();
    } catch (error: unknown) {
      Alert.alert('Error', (error as any).response?.data?.error || 'Failed to pick up book');
    }
  };

  const handleBookPress = (bookId: number) => {
    router.push(`/student/book-view/${bookId}`);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a8c9a0" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => router.push('/student/settings')} style={{ padding: 5 }}>
          <Settings size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#a8c9a0']} />}
      >
        {/* User Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile?.name?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.name || 'User Name'}</Text>
            <Text style={styles.userCourse}>
              {profile?.year_level ? `${profile.year_level}${getOrdinal(profile.year_level)} Year` : ''}
              {profile?.course ? ` • ${profile.course}` : ''}
            </Text>
            <Text style={styles.userSchoolId}>{profile?.school_id || ''}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>Linked Subjects</Text>
            <Text style={styles.infoText}>
              {profile?.subjects && profile.subjects.length > 0
                ? profile.subjects.map((s: Subject) => s.code).join(', ')
                : 'No subjects linked'}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>Preferred Genres</Text>
            <View style={styles.genreList}>
              {profile?.genres && profile.genres.length > 0 ? (
                profile.genres.map((genre: Genre) => (
                  <View key={genre.id} style={styles.genreChip}>
                    <Text style={styles.genreText}>{genre.name}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.infoText}>No genres selected</Text>
              )}
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'borrowed' && styles.activeTab, activeTab === 'borrowed' && {backgroundColor: '#a8c9a0'}]}
            onPress={() => setActiveTab('borrowed')}
          >
            <Text style={[styles.tabText, activeTab === 'borrowed' && styles.activeTabText]}>Borrowed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reserved' && styles.activeTab, activeTab === 'reserved' && {backgroundColor: '#d4a5b8'}]}
            onPress={() => setActiveTab('reserved')}
          >
            <Text style={[styles.tabText, activeTab === 'reserved' && styles.activeTabText]}>Reserved</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab, activeTab === 'history' && {backgroundColor: '#a8c9a0'}]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'borrowed' && <BorrowedBooks books={borrowed} onRenew={handleRenew} onPress={handleBookPress} />}
          {activeTab === 'reserved' && <ReservedBooks books={reserved} onCancel={handleCancelReservation} onPickup={handlePickup} onPress={handleBookPress} />}
          {activeTab === 'history' && <HistoryBooks books={history} onPress={handleBookPress} />}
        </View>
      </ScrollView>

      <UserNavBar />
    </View>
  );
}

// ===============================================
// Styles
// ===============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 40,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d4a5b8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  userCourse: {
    fontSize: 16,
    color: '#555',
    marginTop: 2,
  },
  userSchoolId: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
    fontStyle: 'italic',
  },
  infoSection: {
    marginTop: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  genreList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    backgroundColor: '#e9ecef',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  genreText: {
    fontSize: 12,
    color: '#495057',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 15,
    backgroundColor: '#e9ecef',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    // Active styles are applied inline with color
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    padding: 15,
  },
  bookCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bookCover: {
    width: 70,
    height: 105,
    borderRadius: 8,
    marginRight: 15,
  },
  bookDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  bookAuthor: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#555',
  },
  overdueText: {
    color: '#c0392b',
    fontWeight: 'bold',
  },
  overdueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#fbe9e7',
    padding: 4,
    borderRadius: 4,
  },
  renewButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  renewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  actionButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  pickupButton: {
    backgroundColor: '#27ae60',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    opacity: 0.7,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
  },
});