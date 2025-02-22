import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity, Platform, Text, FlatList, Animated, Modal } from 'react-native';
import { Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import { Foundation } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const StreamingScreen = ({ route }) => {
    const { episodeId, showId, episodes, type } = route.params;
    const video = useRef(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [videoStatus, setVideoStatus] = useState({});
    const [qualities, setQualities] = useState([]);
    const [qualityModalVisible, setQualityModalVisible] = useState(false);
    const [savedPosition, setSavedPosition] = useState(0);
    const [selectedQuality, setSelectedQuality] = useState('');
    const [resizeMode, setResizeMode] = useState('contain');
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(episodes.findIndex((episode) => episode.id === episodeId));
    const [paneVisible, setPaneVisible] = useState(false);
    const paneAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;
    const navigation = useNavigation();
  
    useEffect(() => {
      const fetchVideoData = async () => {
        try {
          const url = `https://consumet1-sand.vercel.app/meta/tmdb/watch/${episodeId}?id=${showId}`;
          console.log(`Episode ID: ${episodeId}`);
          console.log(`Show ID: ${showId}`);
  
          const response = await axios.get(url);
          const videoData = response.data;
          console.log(videoData);
          setVideoUrl(videoData.sources[2].url);
          setQualities(videoData.sources);
          setSelectedQuality(videoData.sources[0].quality);
        } catch (error) {
          console.error(error.message);
        }
      };
  
      fetchVideoData();
  
      const enableImmersiveMode = async () => {
        if (Platform.OS === 'android') {
          await NavigationBar.setVisibilityAsync('hidden');
          await NavigationBar.setBehaviorAsync('inset-swipe');
        }
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      };
  
      enableImmersiveMode();
  
      return () => {
        const disableImmersiveMode = async () => {
          if (Platform.OS === 'android') {
            await NavigationBar.setVisibilityAsync('visible');
          }
          await ScreenOrientation.unlockAsync();
        };
  
        disableImmersiveMode();
      };
    }, [episodeId, showId, type]);
  
    const handlePlayPause = async () => {
      if (video.current) {
        const status = await video.current.getStatusAsync();
        if (status.isPlaying) {
          await video.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await video.current.playAsync();
          setIsPlaying(true);
        }
      }
    };
  
    const handleForward = async () => {
      if (video.current) {
        const status = await video.current.getStatusAsync();
        video.current.setPositionAsync(status.positionMillis + 10000);
      }
    };
  
    const handleBackward = async () => {
      if (video.current) {
        const status = await video.current.getStatusAsync();
        video.current.setPositionAsync(status.positionMillis - 10000);
      }
    };
  
    const handleSeek = async (value) => {
      if (video.current) {
        video.current.setPositionAsync(value);
      }
    };
  
    const toggleControlsVisibility = () => {
      setControlsVisible(!controlsVisible);
    };
  
    const formatTime = (timeMillis) => {
      const totalSeconds = timeMillis / 1000;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
  
    const handleQualityPress = async (quality) => {
      const selectedSource = qualities.find(q => q.quality === quality);
      if (video.current && selectedSource) {
        const status = await video.current.getStatusAsync();
        setSavedPosition(status.positionMillis);
        await video.current.pauseAsync();
        setSelectedQuality(quality);
        setVideoUrl(selectedSource.url);
      }
      setQualityModalVisible(false);
    };
  
    useEffect(() => {
      const restorePlaybackPosition = async () => {
        if (video.current && savedPosition > 0) {
          await video.current.setPositionAsync(savedPosition);
          await video.current.playAsync();
          setSavedPosition(0);
        }
      };
  
      restorePlaybackPosition();
    }, [videoUrl, savedPosition]);
  
    const handleEpisodePress = async (episode) => {
      if (video.current) {
        await video.current.pauseAsync();
        setSavedPosition(0);
        setCurrentEpisodeIndex(episodes.findIndex((ep) => ep.id === episode.id));
        try {
          const response = await axios.get(`https://consumet1-sand.vercel.app/meta/tmdb/watch/${episode.id}?id=${showId}`);
          const videoData = response.data;
          console.log(videoData);
          setVideoUrl(videoData.sources[0].url);
          setQualities(videoData.sources);
          setSelectedQuality(videoData.sources[0].quality);
        } catch (error) {
          console.error(error);
        }
        setPaneVisible(false);
      }
    };
  
    const handleNextEpisode = async () => {
      const nextEpisodeIndex = currentEpisodeIndex + 1;
      if (nextEpisodeIndex < episodes.length) {
        const nextEpisode = episodes[nextEpisodeIndex];
        try {
          await handleEpisodePress(nextEpisode);
          setCurrentEpisodeIndex(nextEpisodeIndex);
        } catch (error) {
          console.error('Error handling next episode:', error);
        }
      } else {
        console.log('No more episodes available.');
      }
    };
  
    const openPane = () => {
      setPaneVisible(true);
      Animated.timing(paneAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };
  
    const closePane = () => {
      Animated.timing(paneAnim, {
        toValue: Dimensions.get('window').width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setPaneVisible(false));
    };
  
    const toggleResizeMode = () => {
      const nextResizeMode = resizeMode === 'contain' ? 'cover' : resizeMode === 'cover' ? 'stretch' : 'contain';
      setResizeMode(nextResizeMode);
    };
  
    if (!videoUrl) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      );
    }
  
    return (
      <TouchableOpacity style={styles.container} onPress={toggleControlsVisibility} activeOpacity={1}>
        <Video
          ref={video}
          source={{ uri: videoUrl }}
          style={styles.video}
          useNativeControls={false}
          resizeMode={resizeMode}
          onPlaybackStatusUpdate={status => setVideoStatus(status)}
          shouldPlay={true}
        />
        {controlsVisible && (
          <View style={styles.controls}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topControlButton}>
              <MaterialIcons name="keyboard-backspace" size={50} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleBackward}>
              <MaterialIcons name="replay-10" size={50} color="blue" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePlayPause}>
              <Icon name={isPlaying ? "pause" : "play"} size={50} color="blue" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForward}>
              <MaterialIcons name="forward-10" size={50} color="blue" />
            </TouchableOpacity>
          </View>
        )}
        {controlsVisible && (
          <View style={styles.seekBarContainer}>
            <Text style={styles.timeText}>{formatTime(videoStatus.positionMillis)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={videoStatus.durationMillis}
              value={videoStatus.positionMillis}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor="blue"
              maximumTrackTintColor="white"
              thumbTintColor="blue"
            />
            <Text style={styles.timeText}>{formatTime(videoStatus.durationMillis)}</Text>
          </View>
        )}
  
        {controlsVisible && (
          <View style={styles.bottomButtons}>
            <TouchableOpacity style={styles.bottomButton} onPress={() => setQualityModalVisible(true)}>
              <MaterialIcons name="high-quality" size={32} color="blue" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton} onPress={openPane}>
              <MaterialIcons name="movie" size={32} color="blue" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton} onPress={toggleResizeMode}>
              <MaterialIcons name="zoom-out-map" size={32} color="blue" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton} onPress={handleNextEpisode}>
              <Foundation name="next" size={32} color="blue" />
            </TouchableOpacity>
          </View>
        )}
  
        <Modal visible={qualityModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Quality</Text>
              <FlatList
                data={qualities}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleQualityPress(item.quality)} style={styles.qualityItem}>
                    <Text style={styles.qualityText}>
                      {item.quality} {selectedQuality === item.quality && '✓'}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.quality}
              />
              <TouchableOpacity onPress={() => setQualityModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
  
        {paneVisible && (
          <Animated.View style={[styles.pane, { transform: [{ translateX: paneAnim }] }]}>
            <TouchableOpacity onPress={closePane} style={styles.closePaneButton}>
              <Icon name="close" size={30} color="blue" />
            </TouchableOpacity>
            <Text style={styles.paneTitle}>Episodes:</Text>
            <FlatList
              data={episodes}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleEpisodePress(item)} style={styles.episodeItem}>
                  <Text style={[styles.episodeText, item.id === episodes[currentEpisodeIndex]?.id && styles.checkMark]}>
                    {item.title} {item.id === episodes[currentEpisodeIndex]?.id && '✓'}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'black',
    },
    video: {
      width: '100%',
      height: '100%',
    },
    topControlButton: {
      position: 'absolute',
      bottom: 150,
      left: 10,
      zIndex: 1,
    },
    controls: {
      position: 'absolute',
      top: '40%',
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    seekBarContainer: {
      position: 'absolute',
      bottom: 90,
      left: 10,
      right: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    slider: {
      flex: 1,
      marginHorizontal: 10,
    },
    timeText: {
      color: 'white',
    },
    bottomButtons: {
      position: 'absolute',
      bottom: 10,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    bottomButton: {
      padding: 10,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      width: '80%',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      marginBottom: 10,
    },
    qualityItem: {
      paddingVertical: 10,
    },
    qualityText: {
      fontSize: 18,
    },
    closeButton: {
      marginTop: 10,
      padding: 10,
    },
    closeButtonText: {
      fontSize: 16,
      color: 'blue',
    },
    pane: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: Dimensions.get('window').width * 0.55,
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 20,
      justifyContent: 'center',
    },
    closePaneButton: {
      alignSelf: 'flex-end',
    },
    paneTitle: {
      fontSize: 24,
      marginBottom: 10,
      color: 'white',
    },
    episodeItem: {
      padding: 10,
      borderWidth: 2,
      borderColor: 'white',
      margin: 5,
      borderRadius: 20,
      backgroundColor: '#59514e',
    },
    episodeText: {
      fontSize: 18,
      color: 'white',
    },
    checkMark: {
      color: 'yellow',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'black',
    },
  });
  
  export default StreamingScreen;
