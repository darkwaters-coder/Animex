import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import * as FileSystem from 'expo-file-system';

const DownloadsScreen = () => {
    const [downloads, setDownloads] = useState([]);

    useEffect(() => {
        loadDownloads();
    }, []);

    const loadDownloads = async () => {
        const downloadsDir = `${FileSystem.documentDirectory}downloads/`;

        // Ensure the downloads directory exists
        const dirInfo = await FileSystem.getInfoAsync(downloadsDir);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
        }

        // Read the files in the downloads directory
        try {
            const files = await FileSystem.readDirectoryAsync(downloadsDir);
            setDownloads(files);
        } catch (error) {
            console.error('Failed to load downloads:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Downloaded Episodes:</Text>
            <FlatList
                data={downloads}
                renderItem={({ item }) => (
                    <Text style={styles.item}>{item}</Text>
                )}
                keyExtractor={item => item}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    item: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 10,
    },
});

export default DownloadsScreen;
