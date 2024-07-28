import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';

const { width, height } = Dimensions.get('window');

// Set up notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const ImageViewer = () => {
  const route = useRoute();
  const { uri, headers, title } = route.params;
  const sanitizedTitle = title.replace(/\s+/g, '_');
  const navigation = useNavigation();

  // Function to show notifications
  const showNotification = (title, body) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: null, // Show the notification immediately
    });
  };

  const downloadImage = async () => {
    try {
      console.log('Starting download process...');

      // Request permissions for accessing media library on Android
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        console.log('MediaLibrary permission status:', status);
        if (status !== 'granted') {
          showNotification('Permission Denied', 'Please allow permissions to download the image.');
          return;
        }
      }

      // Define the public directory path for Android
      const downloadsDirectory = FileSystem.documentDirectory + 'Download/';
      console.log('Download directory:', downloadsDirectory);

      const fileUri = Platform.OS === 'android'
        ? `${downloadsDirectory}${sanitizedTitle}.jpg` // Save to Downloads directory on Android
        : `${FileSystem.documentDirectory}${sanitizedTitle}.jpg`; // iOS: use app's private directory

      console.log('File URI:', fileUri);

      // Create the directory if it doesn't exist
      const directoryInfo = await FileSystem.getInfoAsync(downloadsDirectory);
      console.log('Directory info:', directoryInfo);

      if (!directoryInfo.exists) {
        console.log('Directory does not exist, creating...');
        await FileSystem.makeDirectoryAsync(downloadsDirectory, { intermediates: true });
      }

      // Create a download resumable object
      const downloadResumable = FileSystem.createDownloadResumable(
        uri,
        fileUri,
        { headers: { Referer: headers.Referer } }
      );

      console.log('Starting download...');
      // Start the download
      const { uri: localUri, status } = await downloadResumable.downloadAsync();
      console.log('Download status:', status);
      console.log('Downloaded file URI:', localUri);

      // If on Android, save the image to the media library
      if (Platform.OS === 'android') {
        try {
          const asset = await MediaLibrary.createAssetAsync(localUri);
          console.log('Created asset:', asset);

          let album = await MediaLibrary.getAlbumAsync('Download');
          console.log('Album info:', album);

          if (!album) {
            console.log('Album does not exist, creating...');
            album = await MediaLibrary.createAlbumAsync('Download', asset, false);
            console.log('Created album:', album);
          } else {
            console.log('Adding asset to existing album...');
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }

          showNotification('Download Success', 'Image downloaded to Downloads directory.');
        } catch (libraryError) {
          console.error('MediaLibrary Error:', libraryError);
          showNotification('Download ', `Image downloaded successfully.`);
        }
      } else {
        showNotification('Download Success', 'Image downloaded successfully.');
      }
    } catch (error) {
      console.error('Download Error:', error);
      showNotification('Download Error', `Error message: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-sharp" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={downloadImage} style={styles.downloadButton}>
          <Ionicons name="download-sharp" size={30} color="white" />
        </TouchableOpacity>
      </View>
      <ExpoImage
        source={{ uri, headers: { Referer: headers.Referer } }}
        contentFit="fill"
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 20,
  },
  downloadButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ImageViewer;
