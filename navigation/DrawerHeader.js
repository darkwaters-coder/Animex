import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Or your preferred icon library

function DrawerHeader() {
  return (
    <View style={styles.headerContainer}>
      <Image
        source={require('../assets/large.png')} // Replace with your app's icon path
        style={styles.appIcon}
      />
      <Text style={styles.appName}>ANIMEX</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#000', // Background color for the header
    flexDirection:'row'
  },
  appIcon: {
    width: 100, // Adjust the width as needed
    height: 100, // Adjust the height as needed
    borderRadius: 50, // Optional: make the icon circular
  },
  appName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default DrawerHeader;
