import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import axios from 'axios';
import * as NavigationBar from 'expo-navigation-bar';

const MangaReaderScreen = ({ route }) => {
    const { chapterId, provider, chapters } = route.params;
    const [imagesByChapter, setImagesByChapter] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageDimensions, setImageDimensions] = useState({});
    const [currentChapterIndex, setCurrentChapterIndex] = useState(chapters.findIndex(chapter => chapter.id === chapterId));
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    const fetchImages = async (chapterIndex) => {
        const chapter = chapters[chapterIndex];
        if (!chapter || imagesByChapter[chapter.id]) return;  // Do nothing if chapter doesn't exist or images are already loaded

        setLoading(true);
        try {
            const response = await axios.get(`https://consumet-sand.vercel.app/manga/mangahere/read?chapterId=${chapter.id}`);
            const imageUrls = response.data.map(item => item.img);
            const imageHeaders = response.data.map(item => item.headerForImage);

            if (imageUrls.length === 0) {
                throw new Error('No images found');
            }

            setImagesByChapter(prev => ({
                ...prev,
                [chapter.id]: { urls: imageUrls, headers: imageHeaders }
            }));
        } catch (error) {
            console.error('Error fetching images:', error);
            setError('Failed to load images');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
      const enableImmersiveMode = async () => {
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('inset-swipe');
      };
  
      enableImmersiveMode();
  
      return () => {
        const disableImmersiveMode = async () => {
          await NavigationBar.setVisibilityAsync('visible');
        };
  
        disableImmersiveMode();
      };
    }, []);
    useEffect(() => {
        const loadChapterImages = async () => {
            await fetchImages(currentChapterIndex);

            if (currentChapterIndex < chapters.length - 1) {
                await fetchImages(currentChapterIndex + 1);
            }
            if (currentChapterIndex > 0) {
                await fetchImages(currentChapterIndex - 1);
            }
        };

        loadChapterImages();
    }, [currentChapterIndex, chapters]);

    const handleImageLoad = (uri, width, height) => {
        setImageDimensions(prevState => ({
            ...prevState,
            [uri]: { width, height }
        }));
    };

    const handleEndReached = async () => {
        if (currentChapterIndex < chapters.length - 1) {
            const nextChapterIndex = currentChapterIndex + 1;
            await fetchImages(nextChapterIndex);
            setCurrentChapterIndex(nextChapterIndex);
        }
    };

    const handleViewableItemsChanged = ({ viewableItems }) => {
        if (viewableItems.length > 0) {
            const viewableItem = viewableItems[0];
            const chapterId = Object.keys(imagesByChapter).find(chapterId => imagesByChapter[chapterId].urls.includes(viewableItem.item));
            const chapterIndex = chapters.findIndex(chapter => chapter.id === chapterId);

            const pageIndex = imagesByChapter[chapterId].urls.indexOf(viewableItem.item);

            setCurrentChapterIndex(chapterIndex);
            setCurrentPageIndex(pageIndex);
        }
    };

    if (loading && Object.keys(imagesByChapter).length === 0) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
    }

    if (error) {
        return <Text style={styles.error}>{error}</Text>;
    }

    const combinedImages = Object.values(imagesByChapter).reduce((acc, chapter) => {
        return [...acc, ...chapter.urls];
    }, []);

    const renderItem = ({ item, index }) => {
        const dimensions = imageDimensions[item];
        const aspectRatio = dimensions ? dimensions.width / dimensions.height : 1;
        const chapterId = Object.keys(imagesByChapter).find(chapterId => imagesByChapter[chapterId].urls.includes(item));
        const chapterImages = imagesByChapter[chapterId] || { urls: [], headers: [] };

        return (
            <View key={index} style={styles.imageContainer}>
                <ExpoImage
                    source={{ uri: item, headers: chapterImages.headers[chapterImages.urls.indexOf(item)] }}
                    style={[styles.image, { aspectRatio }]}
                    contentFit="contain"
                    onLoad={(event) => handleImageLoad(item, event.source.width, event.source.height)}
                />
            </View>
        );
    };

    const totalChapters = chapters.length;
    const currentChapterId = chapters[currentChapterIndex].id;
    const totalPages = imagesByChapter[currentChapterId] ? imagesByChapter[currentChapterId].urls.length : 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Chapter {currentChapterIndex + 1} / {totalChapters}</Text>
                <Text style={styles.headerText}>Page {currentPageIndex + 1} / {totalPages}</Text>
            </View>
            <FlatList
                data={combinedImages}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.scrollView}
                removeClippedSubviews
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.1}  // Adjust the threshold to trigger earlier
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    header: {
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.0)', // Semi-transparent background
        position: 'absolute', // Position fixed
        width: '100%', // Full width
        zIndex: 1, // Ensure it's on top
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    headerText: {
        color: '#383434',
        fontSize: 16,
    },
    scrollView: {
        padding: 0,
        backgroundColor: 'transparent',
    },
    imageContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        marginBottom: 0,
    },
    image: {
        width: '100%',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    error: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        backgroundColor: 'transparent',
    },
});

export default MangaReaderScreen;
