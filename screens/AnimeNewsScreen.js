import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as NavigationBar from 'expo-navigation-bar';

const NewsItem = React.memo(({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item.id)} style={styles.itemContainer}>
    <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
    <View style={styles.textContainer}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.uploadedAt}>{item.uploadedAt}</Text>
    </View>
  </TouchableOpacity>
));

const AnimeNewsScreen = ({ navigation }) => {
  const [newsFeeds, setNewsFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    const fetchNewsFeeds = async () => {
      try {
        const response = await axios.get('https://consumet-sand.vercel.app/news/ann/recent-feeds');
        setNewsFeeds(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsFeeds();
  }, []);

  const handlePress = useCallback((id) => {
    navigation.navigate('NewsInfo', { id });
  }, [navigation]);

  const renderItem = useCallback(({ item }) => <NewsItem item={item} onPress={handlePress} />, [handlePress]);

  const keyExtractor = useCallback((item) => item.id, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Failed to load news feeds</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <Text style={{color:'white',fontSize:30,marginBottom:20,marginTop:10,fontWeight:'bold',marginRight:10,}}>ANIME NEWS</Text>
      <FlatList
        data={newsFeeds}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContainer: {
    padding: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 5,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 100,
    height: 100,
  },
  textContainer: {
    flex: 1,
    padding: 10,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadedAt: {
    color: '#bbb',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default AnimeNewsScreen;
