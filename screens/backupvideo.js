import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity, Platform, Text, FlatList, Animated,Modal } from 'react-native';
import { Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import { Foundation } from '@expo/vector-icons';

const StreamingScreen = ({ route }) => {
  const { episodeId, provider, episodes } = route.params;
  const video = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoStatus, setVideoStatus] = useState({});
  const [qualities, setQualities] = useState([]);
  const [qualityModalVisible, setQualityModalVisible] = useState(false);
  const [episodeModalVisible, setEpisodeModalVisible] = useState(false); // Added state
  const [savedPosition, setSavedPosition] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [resizeMode, setResizeMode] = useState('contain'); // Add resizeMode state

  const paneAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await axios.get(`https://consumet-sand.vercel.app/anime/${provider}/watch/${episodeId}?server=vidstreaming`);
        const videoData = response.data;
        setVideoUrl(videoData.sources[0].url);
        setQualities(videoData.sources);
        setSelectedQuality(videoData.sources[0].quality);
      } catch (error) {
        console.error(error);
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
  }, [episodeId, provider]);

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
      setSelectedEpisode(episode);
      setSavedPosition(0); // Reset saved position for new episode
      Animated.timing(paneAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const closePane = () => {
    Animated.timing(paneAnim, {
      toValue: Dimensions.get('window').width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSelectedEpisode(null));
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
      />
      {controlsVisible && (
        <View style={styles.controls}>
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
            <MaterialIcons name="high-quality" size={32} color="blue"  />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton} onPress={() => handleEpisodePress(selectedEpisode)}>
            <MaterialIcons name="movie" size={32} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton} onPress={toggleResizeMode}>
            <MaterialIcons name="zoom-out-map" size={32} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton}>
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
      <Animated.View style={[styles.sidePane, { transform: [{ translateX: paneAnim }] }]}>
        <TouchableOpacity onPress={closePane} style={styles.closePaneButton}>
          <Icon name="close" size={30} color="blue" />
        </TouchableOpacity>
        < Text style={{fontSize:24,marginBottom:10,color:'white'}}>Episodes: </Text>
        <FlatList
          data={episodes}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleEpisodePress(item)} style={styles.qualityItem}>
              <Text style={styles.qualityText}>{item.id}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: '45%',
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
  timeText: {
    color: 'white',
    fontSize: 17,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
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
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'black',
    borderRadius: 10,
    height:'70%',
    padding:20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color:'white'
  },
  qualityItem: {
    padding: 10,
    borderWidth:2,
    borderColor:'white',
    margin:5,
    borderRadius:20,
    backgroundColor:'#59514e'
  },
  qualityText: {
    fontSize: 16,
    color:'white'
  },
  closeButton: {
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'white'
  },
  sidePane: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: 'black',
    padding: 20,
    elevation: 5,
  },
  closePaneButton: {
    alignSelf:'flex-end'
    
  },
  episodeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    
  },
  episodeDescription: {
    fontSize: 16,
  },
});

export default StreamingScreen;
