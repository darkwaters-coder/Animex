import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Image as ExpoImage } from 'expo-image';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const MangaInfoScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { mangaId, provider } = route.params;
  const [mangaInfo, setMangaInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaneVisible, setIsPaneVisible] = useState(false);

  useEffect(() => {
    const fetchMangaInfo = async () => {
      setLoading(true);
      console.log(`Fetching manga info for ID: ${mangaId} and Provider: ${provider}`);

      try {
        const response = await axios.get(`https://consumet1-sand.vercel.app/manga/mangahere/info?id=${mangaId}`);
        const mangaData = response.data;
        mangaData.chapters = (mangaData.chapters || []).reverse(); // Reverse chapters here
        setMangaInfo(mangaData);
      } catch (error) {
        console.error('API Error:', error);
        Alert.alert('Error', 'Failed to fetch manga information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMangaInfo();
  }, [mangaId, provider]);

  const handleImagePress = () => {
    navigation.navigate('ImageViewer', { uri: mangaInfo.image, headers: mangaInfo.headers, title: mangaInfo.title });
  };

  const handleChapterPress = useCallback((chapterId) => {
    navigation.navigate('MangaReader', { chapterId, provider, chapters: mangaInfo.chapters });
  }, [navigation, provider, mangaInfo]);

  const renderChapterItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleChapterPress(item.id)} style={styles.chapterContainer}>
      <Text style={styles.chapterTitle}>{item.title || 'Untitled Chapter'}</Text>
      <Text style={styles.chapterDate}>{item.releasedDate || 'Date not available'}</Text>
    </TouchableOpacity>
  );

  const togglePane = useCallback(() => {
    setIsPaneVisible(!isPaneVisible);
  }, [isPaneVisible]);

  if (loading) {
    return <ActivityIndicator size="large" color="#fff" style={styles.loader} />;
  }

  if (!mangaInfo) {
    return <Text style={styles.error}>No manga information available.</Text>;
  }

  const renderGenres = (genres) => {
    return genres ? genres.join(' • ') : 'Unknown Genres';
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.navigation}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-sharp" size={30} color="white" />
          </TouchableOpacity>
          <Ionicons name="share-social-sharp" size={30} color="white" />
        </View>
        <View style={{ flexDirection: 'row', height: '30%' }}>
          <ExpoImage
            source={{ uri: mangaInfo.image, headers: mangaInfo.headers }}
            style={styles.Image}
            contentFit="cover"
            onPress={handleImagePress}
            onTouchStart={handleImagePress}
          />
          <View style={{ width: '50%' }}>
            <Text style={styles.title}>{mangaInfo.title}</Text>
            <Text style={styles.genres}>{renderGenres(mangaInfo.genres)}</Text>
            <Text style={styles.rating}>{mangaInfo.rating}</Text>
            <Text style={styles.status}>Status: {mangaInfo.status}</Text>
          </View>
        </View>
        <View style={{ paddingBottom: 50 }}>
          <Text style={styles.description}>{mangaInfo.description}</Text>
          <TouchableOpacity
            style={styles.readButton}
            onPress={togglePane}
          >
            <Text style={styles.readButtonText}>Read</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Chapters Pane */}
      {isPaneVisible && (
        <View style={styles.pane}>
          <TouchableOpacity onPress={togglePane} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          {mangaInfo.chapters.length > 0 ? (
            <FlatList
              data={mangaInfo.chapters}
              renderItem={renderChapterItem}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={<View style={styles.chaptersHeader}><Text style={styles.subtitle}>Chapters</Text></View>}
            />
          ) : (
            <Text style={styles.noChapters}>No chapters available for this manga.</Text>
          )}
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  Image: {
    width: '40%',
    height: '100%',
    borderRadius: 10,
    marginLeft: 10,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  genres: {
    fontSize: 14,
    color: '#bbb',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    marginVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  status: {
    fontSize: 14,
    color: '#fff',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  readButton: {
    backgroundColor: '#ff6347',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  readButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
  },
  pane: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%', // Adjust height as needed
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  closeButton: {
    alignItems: 'center',
    marginBottom: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  chaptersHeader: {
    paddingVertical: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
  },
  chapterContainer: {
    paddingVertical: 10,
    borderColor: '#fff',
    borderWidth: 1,
    paddingBottom: 5,
    padding: 5,
    marginBottom: 5,
    borderRadius: 10,
    backgroundColor: '#59514e',
  },
  chapterTitle: {
    fontSize: 16,
    color: '#fff',
  },
  chapterDate: {
    fontSize: 12,
    color: '#888',
  },
  noChapters: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MangaInfoScreen;
