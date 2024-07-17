
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import InfoScreen from '../screens/InfoScreen';
import AnimeNewsScreen from '../screens/AnimeNewsScreen'; // Updated import
import DownloadsScreen from '../screens/DownloadsScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StreamingScreen from '../screens/StreamingScreen';
import NewsInfoScreen from '../screens/NewsInfoScreen'; // Added import
import Icon from 'react-native-vector-icons/Ionicons';
import { View, TouchableOpacity } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const tabIcons = {
  HomeStack: 'home-outline',
  AnimeNewsStack: 'newspaper-outline', // Updated icon
  Downloads: 'download-outline',
  Search: 'search-outline',
  Profile: 'person-outline',
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Info" component={InfoScreen} />
      <Stack.Screen name="Streaming" component={StreamingScreen} />
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

function CustomTabBar({ state, navigation }) {
  const routeName = state.routes[state.index].name;

  // Check if any route has 'Streaming' screen active
  const isStreamingActive = state.routes.some(route => route.state?.routes?.some(subRoute => subRoute.name === 'Streaming'));

  if (isStreamingActive) {
    return null; // Hide tab bar for StreamingScreen
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#222831',
        paddingVertical: 10,
        paddingHorizontal: 20,
      }}
    >
      {state.routes.map((route, index) => {
        const iconName = tabIcons[route.name];
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
          >
            <Icon name={iconName} size={24} color="#fff" />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tab.Screen name="HomeStack" component={HomeStack} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="AnimeNewsStack" component={AnimeNewsStack} />
        <Tab.Screen name="Downloads" component={DownloadsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;