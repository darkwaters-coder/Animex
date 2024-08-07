import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';

const DownloadScreen = ({ route, navigation }) => {
  const { downloadUrl, animeName, episodeId, AnimeImage } = route.params;
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const downloadResumable = useRef(null);

  const startDownload = async () => {
    const fileName = `${animeName}_Episode_${episodeId}.mp4`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    downloadResumable.current = FileSystem.createDownloadResumable(
      downloadUrl,
      fileUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        setProgress(progress);
      }
    );

    setIsDownloading(true);
    setIsPaused(false);

    try {
      await downloadResumable.current.downloadAsync();
      setDownloaded(true);
      setIsDownloading(false);
      alert('Download completed!');
    } catch (error) {
      alert('Download failed.');
    }
  };

  const pauseDownload = async () => {
    if (downloadResumable.current) {
      try {
        await downloadResumable.current.pauseAsync();
        setIsDownloading(false);
        setIsPaused(true);
      } catch (error) {
        alert('Failed to pause download.');
      }
    }
  };

  const resumeDownload = async () => {
    if (downloadResumable.current) {
      setIsDownloading(true);
      setIsPaused(false);

      try {
        await downloadResumable.current.resumeAsync();
      } catch (error) {
        alert('Failed to resume download.');
      }
    }
  };

  useEffect(() => {
    if (downloaded && !isDownloading) {
      // Ensure that 'Download Complete' message is shown correctly
      alert('Download completed!');
    }
  }, [downloaded, isDownloading]);

  return (
    <View style={styles.container}>
      {isDownloading ? (
        <View style={styles.progressContainer}>
          <Text>Downloading...</Text>
          {Platform.OS === 'android' ? (
            <View style={styles.progressBar}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text>{Math.round(progress * 100)}%</Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#0000ff" />
          )}
          {!isPaused ? (
            <Button title="Pause" onPress={pauseDownload} />
          ) : (
            <Button title="Resume" onPress={resumeDownload} />
          )}
        </View>
      ) : downloaded ? (
        <Text>Download Complete!</Text>
      ) : (
        <Button title="Start Download" onPress={startDownload} />
      )}
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    alignItems: 'center',
  },
});

export default DownloadScreen;
