// navigation/DrawerNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MangaStack from './MangaStack';
import MovieStack from './MovieStack';
import DownloadsScreen from '../screens/DownloadsScreen';

const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: '#333', width: 250 },
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#888',
      }}
    >
      <Drawer.Screen name="Manga" component={MangaStack} />
      <Drawer.Screen name="Movies" component={MovieStack} />
      <Drawer.Screen name="Downloads" component={DownloadsScreen} />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;
