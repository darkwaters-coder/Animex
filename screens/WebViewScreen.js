import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewScreen = ({ route, navigation }) => {
  const { downloadLink, animeName, episodeId ,AnimeImage} = route.params;

  const onShouldStartLoadWithRequest = (request) => {
    const { url } = request;
    if (url.includes('download')) {
      // Navigate to DownloadScreen with the download URL, anime name, and episode ID
      navigation.navigate('DownloadScreen', { downloadUrl: url, animeName, episodeId ,AnimeImage});
      return false; // Prevent WebView from loading the URL
    }
    return true; // Allow WebView to load the URL
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: downloadLink }}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WebViewScreen;
