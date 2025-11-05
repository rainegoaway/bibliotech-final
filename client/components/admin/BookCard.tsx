import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BookOpen, Edit2, Trash2, Eye } from 'lucide-react-native';

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
  is_overdue?: boolean;
  fine?: number;
}

interface BookCardProps {
  book: Book;
  onView: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export default function BookCard({ 
  book, 
  onView, 
  onEdit, 
  onDelete
}: BookCardProps) {
  
  const isOverdue = book.is_overdue;

  const getStatusBadgeColor = () => {
    if (isOverdue) return '#c0392b'; // Overdue Red
    switch(book.status) {
      case 'available': return '#27ae60'; // Green
      case 'borrowed': return '#e67e22'; // Orange
      case 'reserved': return '#3498db'; // Blue
      case 'maintenance': return '#7f8c8d'; // Gray
      default: return '#95a5a6';
    }
  };

  const getStatusText = () => {
    if (isOverdue) return 'OVERDUE';
    return book.status.toUpperCase();
  };

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: getStatusBadgeColor() }]}>
            <BookOpen size={24} color="#fff" />
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
          <Text style={styles.author} numberOfLines={1}>{book.author}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColor() }]}>
          <Text style={styles.statusText}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      {/* Details Row */}
      <View style={styles.details}>
        {isOverdue && book.fine !== undefined && book.fine > 0 && (
          <Text style={styles.fineText}>
            Fine: ₱{book.fine.toFixed(2)}
          </Text>
        )}
        <Text style={styles.detailText}>
          📚 QR: {book.qr_code}
        </Text>
        <Text style={styles.detailText}>
          📍 Shelf: {book.shelf_location}
        </Text>
        {book.isbn && (
          <Text style={styles.detailText} numberOfLines={1}>
            🔢 ISBN: {book.isbn}
          </Text>
        )}
        {book.publication_year && (
          <Text style={styles.detailText}>
            📅 Year: {book.publication_year}
          </Text>
        )}
        {book.genre_names && (
          <Text style={styles.detailText} numberOfLines={1}>
            🏷️ {book.genre_names}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => onView(book)}
        >
          <Eye size={16} color="#fff" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(book)}
        >
          <Edit2 size={16} color="#fff" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(book)}
        >
          <Trash2 size={16} color="#fff" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  author: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  details: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  fineText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#c0392b',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  viewButton: {
    backgroundColor: '#3498db',
  },
  editButton: {
    backgroundColor: '#f39c12',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});