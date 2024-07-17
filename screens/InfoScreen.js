import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as NavigationBar from 'expo-navigation-bar';

const InfoScreen = ({ route }) => {
  const { id, provider } = route.params;
  const navigation = useNavigation();
  const [animeInfo, setAnimeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentRange, setCurrentRange] = useState('1-20');
  const [displayedEpisodes, setDisplayedEpisodes] = useState([]);

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
      const response = await axios.get(`https://consumet-sand.vercel.app/anime/${provider}/info/${id}`);
      setAnimeInfo(response.data);
    } catch (error) {
      console.error(error);
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
      const response = await axios.get(`https://consumet-sand.vercel.app/anime/${provider}/watch/${episodeId}?server=vidstreaming`);
      const downloadLink = response.data.download;
      console.log(`Download link for episode ${episodeId}: ${downloadLink}`);
      // Add download management logic here
    } catch (error) {
      console.error(error);
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
    lineHeight: 20,
  },
  details: {
    color: '#fff',
    marginTop: 10,
  },
  episodesHeader: {
    color: '#fff',
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  picker: {
    height: 50,
    width: 150,
    color: 'white',
    backgroundColor: '#333',
    marginVertical: 10,
    borderRadius: 5,
  },
  episodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  episodeItem: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  episodeText: {
    color: '#fff',
    fontSize: 16,
  },
  downloadButton: {
    padding: 10,
    backgroundColor: '#1e90ff',
    borderRadius: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

export default InfoScreen;
