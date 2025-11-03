// GenreTabs.tsx - Simplified version
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Genre {
  id: number;
  name: string;
  icon?: string;
}

interface GenreTabsProps {
  allGenres: Genre[];
  selectedGenre: string;
  onSelectGenre: (genreName: string) => void;
}

export default function GenreTabs({
  allGenres,
  selectedGenre,
  onSelectGenre,
}: GenreTabsProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsContainer}
    >
      {/* All tab */}
      <TouchableOpacity 
        style={[
          styles.tab,
          selectedGenre === 'All' && styles.tabSelected
        ]}
        onPress={() => onSelectGenre('All')}
      >
        <Text style={[
          styles.tabText,
          selectedGenre === 'All' && styles.tabTextSelected
        ]}>All</Text>
      </TouchableOpacity>

      {/* Genre tabs */}
      {allGenres.map((genre) => (
        <TouchableOpacity 
          key={genre.id}
          style={[
            styles.tab,
            selectedGenre === genre.name && styles.tabSelected
          ]}
          onPress={() => onSelectGenre(genre.name)}
        >
          {genre.icon && <Text style={styles.tabIcon}>{genre.icon}</Text>}
          <Text style={[
            styles.tabText,
            selectedGenre === genre.name && styles.tabTextSelected
          ]}>{genre.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    gap: 12,
    paddingRight: 20,
    marginTop: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    gap: 6,
  },
  tabSelected: {
    backgroundColor: '#d4a5b8',
  },
  tabIcon: {
    fontSize: 16,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});