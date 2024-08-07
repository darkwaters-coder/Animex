import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';


const { width } = Dimensions.get('window');
const numColumns = 3;
const itemWidth = width / numColumns - 17;

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const navigation = useNavigation();

  const handleSearch = async (newQuery) => {
    if (!newQuery) return;

    try {
      const response = await axios.get(`https://consumet1-sand.vercel.app/meta/tmdb/${newQuery}?page=${page}`);
      if (response.data && response.data.results) {
        setResults(prevResults => (page === 1 ? response.data.results : [...prevResults, ...response.data.results]));
      } else {
        Alert.alert('Error', 'No results found.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch results.');
    }
  };
  useEffect(() => {
    const enableImmersiveMode = async () => {
      await NavigationBar.setVisibilityAsync('hidden');
      await NavigationBar.setBehaviorAsync('inset-swipe');
    };

    enableImmersiveMode();

    return () => {
      const disableImmersiveMode = async () => {
        await NavigationBar.setVisibilityAsync('visible');
      };

      disableImmersiveMode();
    };
  }, []);

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [page]);

  const handleMoviePress = (id, type) => {
    if (id && type) {
      navigation.navigate('MovieInfo', { id, type });
    } else {
      Alert.alert('Error', 'Invalid Movie information.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleMoviePress(item.id, item.type)} style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );

  const handleNextPage = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={{color:'white',fontSize:20,}}>Search Anime</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search for an anime..."
          value={query}
          onChangeText={text => {
            setQuery(text);
            setPage(1);
            handleSearch(text);
          }}
        />
        <Ionicons name="search" size={32} color="white" onPress={() => handleSearch(query)} />
      </View>
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
      />
      {results.length > 0 && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNextPage}>
          <Text style={styles.nextButtonText}>Next Page</Text>
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
  input: {
    height: 40,
    borderColor: '#fff',
    borderWidth: 1,
    color: '#fff',
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '80%',
  },
  list: {
  

    
  },
  itemContainer: {
    width: itemWidth,
    padding: 5,
    borderColor:'white',
    borderWidth: 1,
    margin:2,
    borderRadius:7
    
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
  nextButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#1e90ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
});

export default SearchScreen;
