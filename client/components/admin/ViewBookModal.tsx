import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, BookOpen, MapPin, Calendar, Hash, User } from 'lucide-react-native';
import api from '../../src/services/api';

interface ViewBookModalProps {
  visible: boolean;
  onClose: () => void;
  bookId: number | null;
  isAdmin?: boolean;
  onBookReturned?: () => void; // Callback to refresh the book list after return
}

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
  current_borrower_id?: number;
  total_borrows: number;
  genres?: Array<{ id: number; name: string; icon: string; color: string }>;
  subjects?: Array<{ id: number; code: string; name: string; category: string }>;
}

interface Borrower {
  id: number;
  name: string;
  school_id: string;
}

interface ActiveBorrow {
  id: number;
  book_id: number;
  user_id: number;
  borrowed_date: string;
  due_date: string;
  status: string;
  is_overdue?: boolean;
  fine?: number;
}

const ViewBookModal: React.FC<ViewBookModalProps> = ({
  visible,
  onClose,
  bookId,
  isAdmin = false,
  onBookReturned,
}) => {
  const [book, setBook] = useState<BookDetails | null>(null);
  const [borrower, setBorrower] = useState<Borrower | null>(null);
  const [activeBorrow, setActiveBorrow] = useState<ActiveBorrow | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible && bookId) {
      fetchBookDetails();
    }
  }, [visible, bookId]);

const fetchBookDetails = async () => {
  if (!bookId) return;

  try {
    setLoading(true);
    setError('');

    console.log('📚 Fetching book details for ID:', bookId);

    // Fetch book details
    const response = await api.get(`/books/${bookId}`);
    const bookData = response.data.book;
    setBook(bookData);

    console.log('📖 Book data:', {
      id: bookData.id,
      title: bookData.title,
      status: bookData.status,
      current_borrower_id: bookData.current_borrower_id
    });

    // Clear states first
    setBorrower(null);
    setActiveBorrow(null);

    // Fetch borrower info and borrow record if book is borrowed OR reserved
    if ((bookData.status === 'borrowed' || bookData.status === 'reserved') && bookData.current_borrower_id && isAdmin) {
      try {
        console.log('👤 Fetching borrower ID:', bookData.current_borrower_id);
        
        // Get borrower details
        const borrowerResponse = await api.get(`/users/${bookData.current_borrower_id}`);
        const borrowerData = borrowerResponse.data.user || borrowerResponse.data;
        
        console.log('👤 Full borrower data:', JSON.stringify(borrowerData, null, 2));
        
        setBorrower(borrowerData);
        
        console.log('✅ Borrower found:', borrowerData.name);

        // Get borrow record for this specific book
        console.log('📋 Fetching borrow record for book ID:', bookData.id);
        
        const borrowResponse = await api.get(`/borrows/book/${bookData.id}`);
        const borrowData = borrowResponse.data.borrow;
        setActiveBorrow(borrowData);
        
        console.log('✅ Borrow record found:', {
          id: borrowData.id,
          user_id: borrowData.user_id,
          due_date: borrowData.due_date,
          status: borrowData.status
        });

      } catch (err: any) {
        console.error('❌ Error fetching borrower/borrow info:', {
          message: err.message,
          status: err.response?.status,
          url: err.config?.url,
          data: err.response?.data
        });
      }
    } else {
      console.log('ℹ️ Book status:', bookData.status, 'current_borrower_id:', bookData.current_borrower_id, 'isAdmin:', isAdmin);
    }
  } catch (err: any) {
    console.error('❌ Error fetching book details:', err);
    setError('Failed to load book details');
  } finally {
    setLoading(false);
  }
};

  const handleReturnBook = async () => {
    if (!activeBorrow || !book) return;

    const fine = activeBorrow.fine || 0;
    const isOverdue = activeBorrow.is_overdue || false;

    let alertMessage = `Are you sure you want to return "${book.title}"?`;
    if (isOverdue && fine > 0) {
      alertMessage += `\n\nThis book is overdue. A fine of ₱${fine.toFixed(2)} has been recorded.`;
    }

    Alert.alert(
      'Return Book',
      alertMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Return',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await api.post(`/borrows/return/${activeBorrow.id}`);
              
              Alert.alert('Success', 'Book returned successfully!', [
                {
                  text: 'OK',
                  onPress: () => {
                    onBookReturned?.(); // Refresh the book list
                    onClose(); // Close the modal
                  },
                },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to return book');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#4CAF50';
      case 'borrowed':
        return '#f44336';
      case 'reserved':
        return '#FF9800';
      case 'maintenance':
        return '#9E9E9E';
      default:
        return '#666';
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'available':
        return styles.statusAvailable;
      case 'borrowed':
        return styles.statusBorrowed;
      case 'reserved':
        return styles.statusReserved;
      case 'maintenance':
        return styles.statusMaintenance;
      default:
        return styles.statusDefault;
    }
  };

  const renderContent = () => {
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
        </View>
      );
    }

    return (
      <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
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
          <View style={[styles.statusBadge, getStatusBadgeStyle(book.status)]}>
            <Text style={styles.statusText}>
              {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Borrower Info (Admin only, if borrowed or reserved) */}
      {isAdmin && (book.status === 'borrowed' || book.status === 'reserved') && borrower && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Borrower</Text>
          <View style={styles.borrowerCard}>
            <User size={20} color="#666" />
            <View style={styles.borrowerInfo}>
              <Text style={styles.borrowerName}>{borrower.name}</Text>
              <Text style={styles.borrowerId}>{borrower.school_id}</Text>
            </View>
          </View>
          
          {/* Due Date Info */}
          {activeBorrow && (
            <>
              <View style={styles.dueDateInfo}>
                <Calendar size={16} color={activeBorrow.is_overdue ? '#c0392b' : '#666'} />
                <Text style={[styles.dueDateText, activeBorrow.is_overdue && styles.overdueText]}>
                  Due: {new Date(activeBorrow.due_date).toLocaleDateString()}
                </Text>
              </View>
              {activeBorrow.is_overdue && activeBorrow.fine !== undefined && activeBorrow.fine > 0 && (
                <View style={styles.fineInfo}>
                  <Text style={styles.fineText}>
                    Fine: ₱{activeBorrow.fine.toFixed(2)}
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Reserved By Info (if book is reserved) */}
          {book.status === 'reserved' && (
            <View style={styles.reservedInfo}>
              <Text style={styles.reservedText}>
                ⏳ Reserved - Will be available for pickup after return
              </Text>
            </View>
          )}

          {/* Return Button for Admin (show for both borrowed and reserved status) */}
          {activeBorrow && (
            <TouchableOpacity
              style={[styles.returnButton, actionLoading && styles.buttonDisabled]}
              onPress={handleReturnBook}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.returnButtonText}>
                  {book.status === 'reserved' ? 'RETURN & NOTIFY RESERVER' : 'RETURN BOOK'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

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
            <Text style={styles.infoText}>{book.shelf_location}</Text>
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
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Details</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {renderContent()}

          {/* Footer */}
          {!loading && !error && (
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.closeFooterButton} onPress={onClose}>
                <Text style={styles.closeFooterButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666',
  },
  errorContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#dc3545',
    textAlign: 'center',
  },
  modalContent: {
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
  infoText: {
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
  borrowerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 12,
  },
  borrowerInfo: {
    flex: 1,
  },
  borrowerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  borrowerId: {
    fontSize: 13,
    color: '#666',
  },
  dueDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  dueDateText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  returnButton: {
    backgroundColor: '#ff5722',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  closeFooterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#d4a5b8',
    alignItems: 'center',
  },
  closeFooterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reservedInfo: {
  backgroundColor: '#fff3cd',
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderRadius: 8,
  marginBottom: 12,
  borderLeftWidth: 4,
  borderLeftColor: '#ffc107',
},
reservedText: {
  fontSize: 13,
  color: '#856404',
  fontWeight: '600',
},
overdueText: {
  color: '#c0392b',
},
fineInfo: {
  backgroundColor: '#fbe9e7',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  marginBottom: 12,
},
fineText: {
  fontSize: 14,
  color: '#c0392b',
  fontWeight: 'bold',
  textAlign: 'center',
},
});

export default ViewBookModal;