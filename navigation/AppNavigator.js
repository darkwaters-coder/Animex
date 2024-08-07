import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import InfoScreen from '../screens/InfoScreen';
import AnimeNewsScreen from '../screens/AnimeNewsScreen';
import DownloadScreen from '../screens/DownloadScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StreamingScreen from '../screens/StreamingScreen';
import NewsInfoScreen from '../screens/NewsInfoScreen';
import MangaSearchScreen from '../screens/MangaSearchScreen';
import MangaInfoScreen from '../screens/MangaInfoScreen';
import MangaReaderScreen from '../screens/MangaReaderScreen';
import ImageViewer from '../screens/ImageViewerScreen';
import MovieSearchScreen from '../screens/MovieSearchScreen';
import MovieInfoScreen from '../screens/MovieInfoScreen';
import MovieStreamingScreen from '../screens/MovieStreamingScreen';
import WatchlistScreen from '../screens/WatchListScreen';
import WebViewScreen from '../screens/WebViewScreen';
import Icon from 'react-native-vector-icons/Ionicons'; // Import icon library
import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const tabIcons = {
  HomeStack: 'home-outline',
  AnimeNewsStack: 'newspaper-outline',
  Downloads: 'download-outline',
  Search: 'search-outline',
  Profile: 'person-outline',
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Info" component={InfoScreen} />
      <Stack.Screen name="WebView" component={WebViewScreen} />
      <Stack.Screen name="DownloadScreen" component={DownloadScreen} />
      <Stack.Screen name="Streaming" component={StreamingScreen} />
    </Stack.Navigator>
  );
}

function MangaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MangaSearch" component={MangaSearchScreen} />
      <Stack.Screen name="MangaInfo" component={MangaInfoScreen} />
      <Stack.Screen name="MangaReader" component={MangaReaderScreen} />
      <Stack.Screen name="ImageViewer" component={ImageViewer} />
    </Stack.Navigator>
  );
}

function MovieStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MovieSearch" component={MovieSearchScreen} />
      <Stack.Screen name="MovieInfo" component={MovieInfoScreen} />
      <Stack.Screen name="MovieStreaming" component={MovieStreamingScreen} />
    </Stack.Navigator>
  );
}

function AnimeNewsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AnimeNews" component={AnimeNewsScreen} />
      <Stack.Screen name="NewsInfo" component={NewsInfoScreen} />
    </Stack.Navigator>
  );
}

function DrawerHeader() {
  return (
    <View style={styles.drawerHeader}>
      <Image
        source={require('../assets/large.png')} // Path to your app icon
        style={styles.drawerIcon}
      />
      <Text style={styles.drawerTitle}>ANIMEX</Text>
    </View>
  );
}

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerHeader />
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

function CustomTabBar({ state, navigation }) {
  const routeName = state.routes[state.index].name;

  // Check if the 'Streaming' route is active in any of the stacks
  const isStreamingActive = state.routes.some(route => route.state?.routes?.some(subRoute => subRoute.name === 'Streaming'));
  const isMovieStreamingActive = state.routes.some(route => route.state?.routes?.some(subRoute => subRoute.name === 'MovieStreaming'));

  if (isStreamingActive || isMovieStreamingActive) {
    return null;
  }

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const iconName = tabIcons[route.name];
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
          >
            <Icon name={iconName} size={24} color="#fff" style={styles.tabIcon} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="HomeStack" component={HomeStack} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="AnimeNewsStack" component={AnimeNewsStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        drawerIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Manga/Manhwa':
              iconName = 'book-outline'; // Choose appropriate icon
              break;
            case 'Movies/Tvshows':
              iconName = 'film-outline'; // Choose appropriate icon
              break;
            case 'Downloads':
              iconName = 'download-outline';
              break;
            default:
              iconName = 'menu-outline'; // Default icon
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        drawerActiveTintColor: 'blue',
        drawerInactiveTintColor: 'gray',
        drawerItemStyle: { marginVertical: 5 },
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#000',
          paddingTop: 10,
        },
      })}
    >
      <Drawer.Screen name="Home" component={TabNavigator} />
      <Drawer.Screen name="Manga/Manhwa" component={MangaStack} />
      <Drawer.Screen name="Movies/Tvshows" component={MovieStack} />
      <Drawer.Screen name="Watchlist" component={WatchlistScreen} />
      <Drawer.Screen name="Downloads" component={DownloadScreen} />
    </Drawer.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#222831',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tabIcon: {
    color: '#fff',
  },
  drawerHeader: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#000',
    borderBottomWidth: 0,
    borderBottomColor: '#333',
    flexDirection: 'row',
  },
  drawerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  drawerTitle: {
    color: '#fff',
    fontSize: 20,
    marginTop: 8,
  },
  customItem: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  customText: {
    color: '#fff',
  },
});

export default AppNavigator;
