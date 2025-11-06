import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function BookListScreen() {
  const router = useRouter();
  const { title, books: booksString } = useLocalSearchParams();
  const books = JSON.parse(booksString as string);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.bookGrid}>
          {books.map((book: any) => (
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
          ))}
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
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
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookCard: {
    width: '48%',
    marginBottom: 20,
  },
  bookCover: {
    width: '100%',
    aspectRatio: 2 / 3,
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
    width: '100%',
    aspectRatio: 2 / 3,
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
});
