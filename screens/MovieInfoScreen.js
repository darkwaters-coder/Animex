import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { Picker } from '@react-native-picker/picker';

const MovieInfoScreen = ({ route }) => {
  const { id, type } = route.params;
  const navigation = useNavigation();
  const [movieInfo, setMovieInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSeason, setCurrentSeason] = useState(null);
  const [seasonOptions, setSeasonOptions] = useState([]);

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
    fetchMovieInfo();
  }, [id, type]);

  useEffect(() => {
    if (movieInfo && type === 'TV Series') {
      const defaultSeason = movieInfo.seasons ? movieInfo.seasons[0] : null;
      setCurrentSeason(defaultSeason);
    }
  }, [movieInfo, type]);

  const fetchMovieInfo = async () => {
    try {
      const response = await axios.get(`https://consumet-sand.vercel.app/meta/tmdb/info/${id}?type=${type}`);
      if (response.status === 200) {
        setMovieInfo(response.data);
        if (type === 'TV Series') {
          setSeasonOptions(response.data.seasons || []);
          setCurrentSeason(response.data.seasons ? response.data.seasons[0] : null);
        }
      } else {
        console.error(`Error: Received status code ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        console.error(`Error: ${error.response.status} - ${error.response.statusText}`);
        console.error(`Error Details:`, error.response.data);
      } else if (error.request) {
        console.error('Error: No response received');
      } else {
        console.error(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderGenres = (genres) => {
    return genres ? genres.join(' • ') : 'Unknown Genres';
  };

  const handleEpisodePress = (episodeId) => {
    if (movieInfo) {
      navigation.navigate('MovieStreaming', { showId: movieInfo.id, episodeId, type: movieInfo.type, episodes: currentSeason.episodes });
      console.log(episodeId);
      console.log(movieInfo.id);
    } else {
      console.error('MovieInfo is not defined');
    }
  };

  const handleMoviePress = () => {
    if (movieInfo) {
      navigation.navigate('MovieStreaming', { showId: movieInfo.id, episodeId:movieInfo.episodeId , type:movieInfo.type});
      console.log(showId)
    } else {
      console.error('MovieInfo is not defined');
    }
  };

  const handleSeasonChange = (season) => {
    if (movieInfo) {
      const selectedSeason = movieInfo.seasons.find(seasonItem => seasonItem.season === parseInt(season));
      setCurrentSeason(selectedSeason);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!movieInfo || !movieInfo.id) {
    return (
      <View style={styles.loadingContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={32} color="white" />
        </TouchableOpacity>
        <Text style={styles.errorText}>Sorry, we don't have this Movie</Text>
      </View>
    );
  }

  const rating = movieInfo.rating ? movieInfo.rating.toString() : 'N/A';

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={32} color="white" />
      </TouchableOpacity>
      <Image source={{ uri: movieInfo.cover }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{movieInfo.title}</Text>
        <Text style={styles.genres}>{renderGenres(movieInfo.genres)}</Text>
        <Text style={styles.synopsis}>{movieInfo.description}</Text>
        <Text style={styles.details}>Release Date: {movieInfo.releaseDate}</Text>
        <Text style={styles.details}>Type: {movieInfo.type}</Text>
        <Text style={styles.details}>Status: {movieInfo.status}</Text>
        <Text style={styles.details}>Sub/Dub: {rating}</Text>

        {type === 'TV Series' ? (
          <>
            <Text style={styles.episodesHeader}>Select Season:</Text>
            <Picker
              selectedValue={currentSeason ? currentSeason.season.toString() : '1'}
              style={styles.picker}
              onValueChange={(itemValue) => handleSeasonChange(itemValue)}
            >
              {seasonOptions.map((season) => (
                <Picker.Item key={season.season} label={`Season ${season.season}`} value={season.season.toString()} />
              ))}
            </Picker>
            <Text style={styles.episodesHeader}>Episodes:</Text>
            {currentSeason && currentSeason.episodes.map((episode) => (
              <View key={episode.id} style={styles.episodeContainer}>
                <TouchableOpacity
                  style={styles.episodeItem}
                  onPress={() => handleEpisodePress(episode.id)}
                >
                  {episode.img && episode.img.hd? (
                      <Image source={{ uri: episode.img.hd }} style={styles.episodeImage} />
                    ) : (
                      <Text>N/A</Text>
                    )}
                  <Text style={styles.episodeText}>Episode {episode.episode}: {episode.title}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => handleDownload(episode.id)}
                >
                  <Ionicons name="download" size={24} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </>
        ) : (
          <TouchableOpacity
            style={styles.playButton}
            onPress={handleMoviePress}
          >
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>
        )}
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
  playButton: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#fff',
  },
  backButton: {
    position: 'absolute',
    bottom: '95%',
    left: 10,
    zIndex: 1,
  },
  episodeImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  }
});
export default MovieInfoScreen;