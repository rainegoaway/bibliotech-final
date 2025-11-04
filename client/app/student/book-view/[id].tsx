import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BookOpen, MapPin, Hash, Calendar, AlertCircle } from 'lucide-react-native';
import api from '../../../src/services/api';
import { getUserData } from '../../../src/utils/storage';

interface BookDetails {
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
  total_borrows: number;
  genres?: Array<{ id: number; name: string; icon: string; color: string }>;
  subjects?: Array<{ id: number; code: string; name: string; category: string }>;
}

interface UserBorrow {
  id: number;
  book_id: number;
  due_date: string;
  status: string;
  is_overdue: boolean;
}

interface UserReservation {
  id: number;
  book_id: number;
  status: 'pending' | 'ready' | 'completed' | 'cancelled' | 'expired';
  reserved_date: string;
  expires_at: string;
  ready_date?: string;
}

export default function BookDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [userBorrow, setUserBorrow] = useState<UserBorrow | null>(null);
  const [userReservation, setUserReservation] = useState<UserReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (id && userId) {
      fetchBookDetails();
      checkUserBorrowStatus();
      checkUserReservationStatus();
    }
  }, [id, userId]);

  const loadUserData = async () => {
    const data = await getUserData();
    setUserId(data?.id || null);
  };

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/books/${id}`);
      setBook(response.data.book || response.data);
    } catch (err) {
      console.error('Error fetching book details:', err);
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const checkUserBorrowStatus = async () => {
    try {
      const response = await api.get(`/borrows/my-books`);
      const borrows = response.data.borrows || response.data || [];
      const activeBorrow = borrows.find(
        (b: UserBorrow) => b.book_id === parseInt(id as string) && b.status === 'active'
      );
      setUserBorrow(activeBorrow || null);
    } catch (err) {
      console.error('Error checking borrow status:', err);
    }
  };

  const checkUserReservationStatus = async () => {
    try {
      const response = await api.get(`/reservations/my-reservations`);
      const reservations = response.data.reservations || response.data || [];
      const activeReservation = reservations.find(
        (r: UserReservation) => r.book_id === parseInt(id as string) && (r.status === 'pending' || r.status === 'ready')
      );
      setUserReservation(activeReservation || null);
    } catch (err) {
      console.error('Error checking reservation status:', err);
    }
  };

  const handleBorrow = async () => {
    if (!book) return;

    Alert.alert(
      'Borrow Book',
      `Do you want to borrow "${book.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Borrow',
          onPress: async () => {
            try {
              setActionLoading(true);
              await api.post(`/borrows/borrow/${book.id}`);
              Alert.alert('Success', 'Book borrowed successfully!');
              fetchBookDetails();
              checkUserBorrowStatus();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to borrow book');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRenew = async () => {
    if (!userBorrow) return;

    Alert.alert(
      'Renew Book',
      'This will extend your due date by 1 day.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Renew',
          onPress: async () => {
            try {
              setActionLoading(true);
              await api.post(`/borrows/renew/${userBorrow.id}`);
              Alert.alert('Success', 'Book renewed successfully!');
              checkUserBorrowStatus();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to renew book');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReserve = async () => {
  if (!book) return;

  console.log('🔍 Current book object:', book);
  console.log('🔍 Book ID:', book.id);

  Alert.alert(
    'Reserve Book',
    `Do you want to reserve "${book.title}"? You'll be notified when it's available.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reserve',
        onPress: async () => {
          try {
            setActionLoading(true);
            
            const payload = { bookId: book.id };
            console.log('📤 Sending reserve request:', payload);
            
            const response = await api.post('/reservations', payload);
            
            console.log('✅ Reserve response:', response.data);
            
            Alert.alert('Success', 'Book reserved successfully!');
            checkUserReservationStatus();
            fetchBookDetails(); // Refresh book details
          } catch (err: any) {
            console.error('❌ Reserve error:', err);
            console.error('❌ Error response:', err.response?.data);
            Alert.alert('Error', err.response?.data?.error || 'Failed to reserve book');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]
  );
};

  const handleCancelReservation = async () => {
    if (!userReservation) return;

    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await api.delete(`/reservations/${userReservation.id}`);
              Alert.alert('Success', 'Reservation cancelled successfully!');
              checkUserReservationStatus();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to cancel reservation');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusBadge = () => {
    if (!book) return null;

    let statusText = book.status.charAt(0).toUpperCase() + book.status.slice(1);
    let style = styles.statusDefault;

    if (userReservation && userReservation.status === 'ready') {
      statusText = 'Available for You';
      style = styles.statusAvailable;
    } else {
      switch (book.status) {
        case 'available':
          style = styles.statusAvailable;
          break;
        case 'borrowed':
          style = styles.statusBorrowed;
          break;
        case 'reserved':
          style = styles.statusReserved;
          break;
        case 'maintenance':
          style = styles.statusMaintenance;
          break;
      }
    }

    return (
      <View style={[styles.statusBadge, style]}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    );
  };

  const renderActionButton = () => {
    if (!book) return null;

    // If user has this book borrowed
    if (userBorrow) {
      if (userBorrow.is_overdue) {
        return (
          <View style={styles.actionSection}>
            <View style={[styles.actionButton, styles.overdueButton]}>
              <AlertCircle size={20} color="#fff" />
              <Text style={styles.actionButtonText}>OVERDUE - Cannot Renew</Text>
            </View>
            <Text style={styles.warningText}>
              ⚠️ Please return this book as soon as possible. You cannot borrow or reserve other books until this is returned.
            </Text>
          </View>
        );
      }

      return (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.renewButton]}
            onPress={handleRenew}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Calendar size={20} color="#fff" />
                <Text style={styles.actionButtonText}>RENEW BOOK</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.infoText}>
            📅 Due: {new Date(userBorrow.due_date).toLocaleDateString()}
          </Text>
        </View>
      );
    }

    // If user has a 'ready' reservation for this book
    if (userReservation && userReservation.status === 'ready') {
      return (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.borrowButton]}
            onPress={handleBorrow}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <BookOpen size={20} color="#fff" />
                <Text style={styles.actionButtonText}>BORROW RESERVED BOOK</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.infoText}>
            Pickup before {new Date(userReservation.expires_at).toLocaleDateString()}
          </Text>
        </View>
      );
    }

    // If user has a 'pending' reservation for this book
    if (userReservation && userReservation.status === 'pending') {
      return (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancelReservation}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>CANCEL RESERVATION</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.infoText}>
            ⏳ You'll be notified when this book becomes available
          </Text>
        </View>
      );
    }

    // If book is available - show borrow button
    if (book.status === 'available') {
      return (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.borrowButton]}
            onPress={handleBorrow}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <BookOpen size={20} color="#fff" />
                <Text style={styles.actionButtonText}>BORROW BOOK</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    // If book is borrowed by someone else - show reserve button
    if (book.status === 'borrowed') {
      return (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.reserveButton]}
            onPress={handleReserve}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>RESERVE BOOK</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.infoText}>
            📚 Currently borrowed. Reserve to get notified when available.
          </Text>
        </View>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d4a5b8" />
        <Text style={styles.loadingText}>Loading book details...</Text>
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Book not found'}</Text>
        <TouchableOpacity style={styles.backButtonError} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Book Header */}
        <View style={styles.bookHeader}>
          <BookOpen size={48} color="#d4a5b8" />
          <View style={styles.bookHeaderText}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>by {book.author}</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          {getStatusBadge()}
        </View>

        {/* Action Button (Borrow/Renew/Reserve/Cancel) */}
        {renderActionButton()}

        {/* QR Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QR Code</Text>
          <View style={styles.qrContainer}>
            <Hash size={20} color="#666" />
            <Text style={styles.qrCode}>{book.qr_code}</Text>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.infoRow}>
            <MapPin size={20} color="#666" />
            <Text style={styles.infoTextDetail}>{book.shelf_location}</Text>
          </View>
        </View>

        {/* Publication Details */}
        {(book.publication_year || book.publisher || book.isbn || book.pages) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Publication Details</Text>
            {book.publication_year && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Year:</Text>
                <Text style={styles.detailValue}>{book.publication_year}</Text>
              </View>
            )}
            {book.publisher && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Publisher:</Text>
                <Text style={styles.detailValue}>{book.publisher}</Text>
              </View>
            )}
            {book.isbn && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ISBN:</Text>
                <Text style={styles.detailValue}>{book.isbn}</Text>
              </View>
            )}
            {book.pages && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Pages:</Text>
                <Text style={styles.detailValue}>{book.pages}</Text>
              </View>
            )}
          </View>
        )}

        {/* Synopsis */}
        {book.synopsis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Synopsis</Text>
            <Text style={styles.synopsis}>{book.synopsis}</Text>
          </View>
        )}

        {/* Genres */}
        {book.genres && book.genres.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genres</Text>
            <View style={styles.chipContainer}>
              {book.genres.map((genre) => (
                <View key={genre.id} style={styles.genreChip}>
                  <Text style={styles.chipIcon}>{genre.icon}</Text>
                  <Text style={styles.chipText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Subjects */}
        {book.subjects && book.subjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Related Subjects</Text>
            <View style={styles.chipContainer}>
              {book.subjects.map((subject) => (
                <View key={subject.id} style={styles.subjectChip}>
                  <Text style={styles.chipText}>{subject.code}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Borrows:</Text>
            <Text style={styles.detailValue}>{book.total_borrows}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 15,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  bookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  bookHeaderText: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  statusContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusAvailable: {
    backgroundColor: '#d4edda',
  },
  statusBorrowed: {
    backgroundColor: '#f8d7da',
  },
  statusReserved: {
    backgroundColor: '#fff3cd',
  },
  statusMaintenance: {
    backgroundColor: '#e2e3e5',
  },
  statusDefault: {
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actionSection: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 8,
  },
  borrowButton: {
    backgroundColor: '#4CAF50',
  },
  renewButton: {
    backgroundColor: '#2196F3',
  },
  reserveButton: {
    backgroundColor: '#FF9800',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  overdueButton: {
    backgroundColor: '#9E9E9E',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  warningText: {
    fontSize: 13,
    color: '#d32f2f',
    textAlign: 'center',
    lineHeight: 18,
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  qrContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  qrCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'monospace',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTextDetail: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  synopsis: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0e6f3',
    gap: 6,
  },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e6f3f0',
  },
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  backButtonError: {
    backgroundColor: '#d4a5b8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});