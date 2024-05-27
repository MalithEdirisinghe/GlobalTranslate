// /HistoryScreen.js
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const HistoryScreen = () => {
    const translations = [
        { id: '1', original: 'Hello', translated: 'Hola' },
        { id: '2', original: 'How are you?', translated: '¿Cómo estás?' },
        // Add more historical data as needed
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Translation History</Text>
            <FlatList
                data={translations}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.original}>{item.original}</Text>
                        <Text style={styles.translated}>{item.translated}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f8ff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#0073e6',
    },
    item: {
        backgroundColor: '#e0f7fa',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    original: {
        fontSize: 18,
        color: '#0073e6',
    },
    translated: {
        fontSize: 18,
        color: '#0073e6',
        marginTop: 5,
    },
});

export default HistoryScreen;
