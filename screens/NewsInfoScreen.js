import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Linking } from 'react-native';
import axios from 'axios';
import * as NavigationBar from 'expo-navigation-bar';

const NewsInfoScreen = ({ route }) => {
  const { id } = route.params;
  const [newsInfo, setNewsInfo] = useState(null);
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
    const fetchNewsInfo = async () => {
      try {
        const response = await axios.get(`https://consumet1-sand.vercel.app/news/ann/info?id=${id}`);
        //console.log('Response data:', response.data);
        setNewsInfo(response.data);
      } catch (error) {
        console.error(error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsInfo();
  }, [id]);

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
        <Text style={styles.loadingText}>Failed to load news info</Text>
      </View>
    );
  }

  if (!newsInfo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No news info available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={{color:'white',fontSize:30,marginBottom:20,marginTop:10,fontWeight:'bold'}}>ANIME NEWS</Text>
      <Image source={{ uri: newsInfo.thumbnail }} style={styles.thumbnail} />
      <Text style={styles.title}>{newsInfo.title}</Text>
      <Text style={styles.uploadedAt}>{newsInfo.uploadedAt}</Text>
      <Text style={styles.intro}>{newsInfo.intro}</Text>
      <Text style={styles.description}>{newsInfo.description}</Text>
      {/* Wrap the url text in a Text component to avoid the error */}
      <Text style={styles.url} onPress={() => Linking.openURL(newsInfo.url)}>Read more</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    padding: 10,
    paddingBottom: 80, // Add padding at the bottom to avoid overlap with the tab bar
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
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  uploadedAt: {
    color: '#bbb',
    marginBottom: 10,
  },
  intro: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  description: {
    color: '#fff',
    fontSize: 16,
  },
  url: {
    color: '#1E90FF',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});

export default NewsInfoScreen;
