import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InfoScreen = ({ route }) => {
  const { id, provider } = route.params;
  const navigation = useNavigation();
  const [animeInfo, setAnimeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentRange, setCurrentRange] = useState('1-20');
  const [displayedEpisodes, setDisplayedEpisodes] = useState([]);

  useEffect(() => {
    const enableImmersiveMode = async () => {
      try {
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('inset-swipe');
      } catch (error) {
        console.error('Failed to enable immersive mode:', error);
      }
    };

    enableImmersiveMode();

    return () => {
      const disableImmersiveMode = async () => {
        try {
          await NavigationBar.setVisibilityAsync('visible');
        } catch (error) {
          console.error('Failed to disable immersive mode:', error);
        }
      };

      disableImmersiveMode();
    };
  }, []);

  useEffect(() => {
    fetchAnimeInfo();
  }, [id, provider]);

  useEffect(() => {
    if (animeInfo && animeInfo.episodes) {
      const range = currentRange.split('-').map(Number);
      const filteredEpisodes = animeInfo.episodes.slice(range[0] - 1, range[1]);
      setDisplayedEpisodes(filteredEpisodes);
    }
  }, [animeInfo, currentRange]);

  const fetchAnimeInfo = async () => {
    try {
      const response = await axios.get(`https://consumet1-sand.vercel.app/anime/gogoanime/info/${id}`);
      setAnimeInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch anime info:', error);
      Alert.alert('Error', 'Failed to fetch anime information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderGenres = (genres) => {
    return genres ? genres.join(' • ') : 'Unknown Genres';
  };

  const handleEpisodePress = (episodeId) => {
    navigation.navigate('Streaming', { episodeId, provider, episodes: animeInfo.episodes });
  };

  const handleDownload = async (episodeId) => {
    try {
      const response = await axios.get(`https://consumet1-sand.vercel.app/anime/${provider}/watch/${episodeId}?server=vidstreaming`);
      const downloadLink = response.data.download;
      console.log(`Download link for episode ${episodeId}: ${downloadLink}`);
      navigation.navigate('WebView', { downloadLink, animeName: animeInfo.title, episodeId ,AnimeImage: animeInfo.image});
    } catch (error) {
      console.error('Failed to fetch download link:', error);
      Alert.alert('Error', 'Failed to fetch download link. Please try again later.');
    }
  };

  const handleAddToWatchlist = async () => {
    try {
      const existingWatchlist = await AsyncStorage.getItem('watchlist');
      const watchlist = existingWatchlist ? JSON.parse(existingWatchlist) : [];

      // Check if the anime is already in the watchlist
      const isAlreadyInWatchlist = watchlist.some(anime => anime.id === id);
      if (isAlreadyInWatchlist) {
        Alert.alert('Info', 'Anime is already in your watchlist.');
        return;
      }

      // Add new anime to the watchlist
      watchlist.push(animeInfo);
      await AsyncStorage.setItem('watchlist', JSON.stringify(watchlist));
      Alert.alert('Success', 'Anime added to watchlist.');
    } catch (error) {
      console.error('Failed to add anime to watchlist:', error);
      Alert.alert('Error', 'Failed to add anime to watchlist. Please try again later.');
    }
  };

  const generateEpisodeRanges = (totalEpisodes) => {
    const ranges = [];
    for (let i = 1; i <= totalEpisodes; i += 20) {
      const end = Math.min(i + 19, totalEpisodes);
      ranges.push(`${i}-${end}`);
    }
    return ranges;
  };

  const handleRangeChange = (value) => {
    setCurrentRange(value);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!animeInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load anime information.</Text>
      </View>
    );
  }

  const episodeRanges = generateEpisodeRanges(animeInfo.episodes.length);

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: animeInfo.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{animeInfo.title}</Text>
        <Text style={styles.genres}>{renderGenres(animeInfo.genres)}</Text>
        <Text style={styles.synopsis}>{animeInfo.description}</Text>
        <Text style={styles.details}>Release Date: {animeInfo.releaseDate}</Text>
        <Text style={styles.details}>Type: {animeInfo.type}</Text>
        <Text style={styles.details}>Status: {animeInfo.status}</Text>
        <Text style={styles.details}>Sub/Dub: {animeInfo.subOrDub}</Text>

        <Text style={styles.episodesHeader}>Episodes:</Text>
        <Picker
          selectedValue={currentRange}
          style={styles.picker}
          onValueChange={(itemValue) => handleRangeChange(itemValue)}
        >
          {episodeRanges.map((range) => (
            <Picker.Item key={range} label={range} value={range} />
          ))}
        </Picker>
        {displayedEpisodes.map((episode) => (
          <View key={episode.id} style={styles.episodeContainer}>
            <TouchableOpacity
              style={styles.episodeItem}
              onPress={() => handleEpisodePress(episode.id)}
            >
              <Text style={styles.episodeText}>Episode {episode.number}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownload(episode.id)}
            >
              <Ionicons name="download" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={styles.watchlistButton}
          onPress={handleAddToWatchlist}
        >
          <Ionicons name="bookmark-outline" size={24} color="white" />
          <Text style={styles.watchlistButtonText}>Add to Watchlist</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  genres: {
    color: '#fff',
    marginTop: 10,
  },
  synopsis: {
    color: '#fff',
    marginTop: 10,
    textAlign: 'justify',
  },
  details: {
    color: '#fff',
    marginTop: 5,
  },
  episodesHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  picker: {
    color: '#fff',
    backgroundColor: '#333',
    marginTop: 10,
  },
  episodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
  },
  episodeItem: {
    flex: 1,
  },
  episodeText: {
    color: '#fff',
  },
  downloadButton: {
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  watchlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
  },
  watchlistButtonText: {
    color: '#fff',
    marginLeft: 10,
  },
});

export default InfoScreen;
