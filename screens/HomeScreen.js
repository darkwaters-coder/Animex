// screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Carousel from 'react-native-reanimated-carousel';
import * as NavigationBar from 'expo-navigation-bar';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();

  // Hide the navigation header
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [recentEpisodes, setRecentEpisodes] = useState([]);
  const [topAiring, setTopAiring] = useState([]);
  const [popularAnime, setPopularAnime] = useState([]);
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
    fetchRecentEpisodes();
    fetchTopAiring();
    fetchPopularAnime();
  }, []);

  const fetchRecentEpisodes = async () => {
    try {
      const response = await axios.get('https://consumet-sand.vercel.app/anime/gogoanime/recent-episodes');
      setRecentEpisodes(response.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTopAiring = async () => {
    try {
      const response = await axios.get(' https://consumet-sand.vercel.app/anime/gogoanime/top-airing');
      setTopAiring(response.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPopularAnime = async () => {
    try {
      const response = await axios.get('https://consumet-sand.vercel.app/meta/anilist/popular?page=1&perPage=10');
      setPopularAnime(response.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  const renderGenres = (genres) => {
    return genres ? genres.join(' • ') : 'Unknown Genres';
  };

  const handleInfoPress = (item) => {
    // Navigate to InfoScreen with the item details
    navigation.navigate('Info', { id: item.id, provider: 'gogoanime' });
  };

  const renderCarouselItem = ({ item }) => (
    <View style={styles.sliderItem}>
      <Image source={{ uri: item.image }} style={styles.sliderImage} />
      <TouchableOpacity style={styles.sliderOverlay} onPress={() => handleInfoPress(item)}>
        <Text style={styles.sliderTitle}>{item.title}</Text>
        <Text style={styles.sliderGenres}>{renderGenres(item.genres)}</Text>
        <View style={styles.sliderButtons}>
          <TouchableOpacity style={styles.sliderButton}>
            <Text style={styles.sliderButtonText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sliderButton} onPress={() => handleInfoPress(item)}>
            <Text style={styles.sliderButtonText}>Info</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderRecentEpisodesItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => handleInfoPress(item)}>
      <Image source={{ uri: item.image }} style={styles.gridItemImage} />
      <Text style={styles.gridItemTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderTopAiringItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => handleInfoPress(item)}>
      <Image source={{ uri: item.image }} style={styles.gridItemImage} />
      <Text style={styles.gridItemTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderPopularAnimeItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => handleInfoPress(item)}>
      <Image source={{ uri: item.image }} style={styles.gridItemImage} />
      <Text style={styles.gridItemTitle}>{item.title.english}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.sliderContainer}>
        <Carousel
          data={topAiring}
          renderItem={renderCarouselItem}
          width={screenWidth}
          height={400} // Increased the height of the slider
          autoPlay={true}
          loop={true}
          autoPlayInterval={6000} // Set auto play interval to 6 seconds
          scrollAnimationDuration={1000} // Set scroll animation duration to 1 second
        />
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recent Episodes</Text>
        <ScrollView horizontal>
          {recentEpisodes.map((item) => (
            <TouchableOpacity key={item.episodeId} style={styles.gridItem} onPress={() => handleInfoPress(item)}>
              <Image source={{ uri: item.image }} style={styles.gridItemImage} />
              <Text style={styles.gridItemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Top Airing</Text>
        <ScrollView horizontal>
          {topAiring.map((item) => (
            <TouchableOpacity key={item.id} style={styles.gridItem} onPress={() => handleInfoPress(item)}>
              <Image source={{ uri: item.image }} style={styles.gridItemImage} />
              <Text style={styles.gridItemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Popular Anime</Text>
        <ScrollView horizontal>
          {popularAnime.map((item) => (
            <TouchableOpacity key={item.id} style={styles.gridItem} onPress={() => handleInfoPress(item)}>
              <Image source={{ uri: item.image }} style={styles.gridItemImage} />
              <Text style={styles.gridItemTitle}>{item.title.english}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Changed to black background
  },
  sliderContainer: {
    height: 400, // Increase the height of the slider container
  },
  sectionContainer: {
    marginTop: 15,
    
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#fff', // Changed text color to white
    
    
  },
  sliderItem: {
    width: screenWidth,
    height: 400, // Increase the height of the slider item
    position: 'relative',
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    
  },
  sliderOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: 10,
  },
  sliderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  sliderGenres: {
    color: '#fff',
    marginTop: 5,
  },
  sliderButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  sliderButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  sliderButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  gridItem: {
    width: 120,
    marginRight: 10,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 20,
    marginTop:10,
    height:'90%',
    marginRight:10,
    paddingBottom:16
  },
  gridItemImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
    marginBottom: 5,
    borderRadius:10
  },
  gridItemTitle: {
    marginTop: 5,
    color: '#fff',
    textAlign:'center',
    fontSize:15
  },
});

export default HomeScreen;
