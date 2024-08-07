import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Carousel from 'react-native-reanimated-carousel';
import * as NavigationBar from 'expo-navigation-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [recentEpisodes, setRecentEpisodes] = useState([]);
  const [topAiring, setTopAiring] = useState([]);
  const [popularAnime, setPopularAnime] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecentEpisodes();
    await fetchTopAiring();
    await fetchPopularAnime();
    setRefreshing(false);
  };

  const fetchRecentEpisodes = async () => {
    try {
      const response = await axios.get('https://consumet1-sand.vercel.app/anime/gogoanime/recent-episodes');
      setRecentEpisodes(response.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTopAiring = async () => {
    try {
      const response = await axios.get('https://consumet1-sand.vercel.app/anime/gogoanime/top-airing');
      setTopAiring(response.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPopularAnime = async () => {
    try {
      const response = await axios.get('https://consumet1-sand.vercel.app/meta/anilist/popular?page=1&perPage=10');
      setPopularAnime(response.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  const renderGenres = (genres) => {
    return genres ? genres.join(' • ') : 'Unknown Genres';
  };

  const handleInfoPress = (item) => {
    navigation.navigate('Info', { id: item.id, provider: 'gogoanime' });
  };

  const renderCarouselItem = ({ item }) => (
    <View style={styles.sliderItem}>
      <Image source={{ uri: item.image }} style={styles.sliderImage} />
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 9)']}
        style={styles.gradientOverlay}
      />
      <View style={styles.sliderOverlay}>
        <View style={styles.sliderContent}>
          <Text style={styles.sliderTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.sliderGenres}>{renderGenres(item.genres)}</Text>
          <View style={styles.sliderButtons}>
            <TouchableOpacity style={styles.sliderButton}>
              <Entypo name="controller-play" size={24} color="black" style={{ marginRight: 5 }} />
              <Text style={styles.sliderButtonText}>Play</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sliderButton} onPress={() => handleInfoPress(item)}>
              <Feather name="info" size={24} color="black" style={{ marginRight: 5 }} />
              <Text style={styles.sliderButtonText}>Info</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const toggleDrawer = () => {
    navigation.toggleDrawer();
  };

  return (
    <ScrollView
      style={styles.scrollContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
        />
      }
    >
      <View style={styles.sliderContainer}>
        <TouchableOpacity style={styles.topButton} onPress={toggleDrawer}>
          <Entypo name="menu" size={42} color="black" />
        </TouchableOpacity>
        <Carousel
          data={topAiring}
          renderItem={renderCarouselItem}
          width={screenWidth}
          height={450}
          autoPlay={true}
          loop={true}
          autoPlayInterval={6000}
          scrollAnimationDuration={1000}
        />
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recent Episodes</Text>
        <ScrollView horizontal>
          {recentEpisodes.map((item) => (
            <TouchableOpacity key={item.episodeId} style={styles.gridItem} onPress={() => handleInfoPress(item)}>
              <Image source={{ uri: item.image }} style={styles.gridItemImage} />
              <Text style={styles.gridItemTitle} numberOfLines={2}>{item.title}</Text>
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
              <Text style={styles.gridItemTitle} numberOfLines={2}>{item.title}</Text>
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
              <Text style={styles.gridItemTitle} numberOfLines={2}>{item.title.english}</Text>
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
    backgroundColor: 'black',
  },
  topButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor:'black'
  },
  sliderContainer: {
    width: screenWidth,
    height: 450,
    position: 'relative',
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '30%',
  },
  sliderOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderContent: {
    width: '100%',
    alignItems: 'center',
  },
  sliderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  sliderGenres: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 70,
  },
  sliderButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 50,
    flexDirection: 'row',
    marginBottom: 20,
  },
  sliderButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  gridItem: {
    width: 120,
    marginRight: 5,
    borderColor: 'white',
    borderWidth: 0,
    borderRadius: 20,
    marginTop: 10,
    paddingBottom: 16,
  },
  gridItemImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    marginBottom: 5,
    borderRadius: 10,
  },
  gridItemTitle: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
  },
  sectionContainer: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
});

export default HomeScreen;
