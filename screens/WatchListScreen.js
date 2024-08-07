import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WatchlistScreen = ({ navigation }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWatchlist = async () => {
    try {
      const watchlistData = await AsyncStorage.getItem('watchlist');
      if (watchlistData) {
        setWatchlist(JSON.parse(watchlistData));
      }
    } catch (error) {
      console.error('Failed to load watchlist', error);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWatchlist();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('Info', { id: item.id, provider: 'gogoanime' })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.genres}>{item.genres.join(' • ')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      style={styles.container}
      data={watchlist}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<Text style={styles.header}>Watchlist</Text>}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor:'black'
  },
  header: {
    color: 'white',
    fontSize: 32,
    padding: 10,
  },
  list: {
    padding: 10,
  },
  item: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 150,
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    padding: 10,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  genres: {
    color: '#aaa',
    marginTop: 5,
  },
});

export default WatchlistScreen;
