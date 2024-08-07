import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Alert, Button } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { Image as ExpoImage } from 'expo-image';

const { width } = Dimensions.get('window');
const numColumns = 3;
const itemWidth = width / numColumns - 20; // Adjusted for better spacing
const fallbackImage = 'https://example.com/path/to/fallback-image.png'; // Replace with your fallback image URL

const MangaSearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const navigation = useNavigation();

  const handleSearch = async (newQuery) => {
    if (!newQuery) return;

    try {
      const response = await axios.get(`https://consumet1-sand.vercel.app/manga/mangahere/${newQuery}`);
      setResults(response.data.results);
      setPage(1); // Reset page number
      setHasNextPage(response.data.hasNextPage);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch manga results. Please try again.');
      console.error(error);
    }
  };

  const loadMoreResults = async () => {
    if (!hasNextPage) return;

    try {
      const response = await axios.get(`https://consumet1-sand.vercel.app/manga/mangahere/${query}?page=${page + 1}`);
      setResults(prevResults => [...prevResults, ...response.data.results]);
      setPage(prevPage => prevPage + 1);
      setHasNextPage(response.data.hasNextPage);
    } catch (error) {
      Alert.alert('Error', 'Failed to load more results. Please try again.');
      console.error(error);
    }
  };

  useEffect(() => {
    const enableImmersiveMode = async () => {
      try {
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('inset-swipe');
      } catch (error) {
        console.error('Failed to enable immersive mode', error);
      }
    };

    enableImmersiveMode();

    return () => {
      const disableImmersiveMode = async () => {
        try {
          await NavigationBar.setVisibilityAsync('visible');
        } catch (error) {
          console.error('Failed to disable immersive mode', error);
        }
      };

      disableImmersiveMode();
    };
  }, []);

  const handleMangaPress = (id) => {
    if (id) {
      navigation.navigate('MangaInfo', { mangaId: id, provider: 'mangahere' });
    } else {
      Alert.alert('Error', 'Invalid Manga information.');
    }
  };

  const renderItem = ({ item }) => {
    const title = item.title;

    return (
      <TouchableOpacity onPress={() => handleMangaPress(item.id)} style={styles.itemContainer}>
        <ExpoImage
          source={{ uri: item.image, headers: item.headerForImage }}
          style={styles.image}
          contentFit="cover"
          onError={() => {
            // Fallback to default image on error
            item.image = fallbackImage;
          }}
        />
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Search Manga</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search for Manga..."
          placeholderTextColor="#ccc"
          value={query}
          onChangeText={text => setQuery(text)}
          onSubmitEditing={() => handleSearch(query)}
        />
        <Ionicons name="search" size={32} color="white" onPress={() => handleSearch(query)} />
      </View>
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()} // Ensure unique keys
        numColumns={numColumns}
        contentContainerStyle={styles.list}
      />
      {hasNextPage && (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={loadMoreResults}
        >
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#fff',
    borderWidth: 1,
    color: '#fff',
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '80%',
    borderRadius: 5,
  },
  list: {
    paddingBottom: 20,
  },
  itemContainer: {
    width: itemWidth,
    padding: 5,
    borderColor: 'white',
    borderWidth: 1,
    margin: 2,
    borderRadius: 7,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  title: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loadMoreButton: {
    backgroundColor: '#ff9900',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  loadMoreText: {
    color: '#000',
    fontSize: 16,
  },
});

export default MangaSearchScreen;
