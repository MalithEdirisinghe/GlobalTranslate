import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { ThemedText } from '../components/ThemedText';

const HistoryScreen = () => {
    const [history, setHistory] = useState([]);
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const q = query(collection(db, 'translationHistory'), where('userId', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setHistory(historyData);
                }
            } catch (error) {
                console.error('Error loading translation history:', error);
            }
        };

        loadHistory();
    }, []);

    const clearHistory = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const q = query(collection(db, 'translationHistory'), where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);

                const batch = writeBatch(db);
                querySnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();

                setHistory([]);
            }
        } catch (error) {
            console.error('Error clearing translation history:', error);
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.historyItem, { backgroundColor: isDarkMode ? '#333' : '#D3D3D3' }]}>
            <ThemedText style={styles.historyText}><ThemedText style={styles.boldText}>Input:</ThemedText> {item.input}</ThemedText>
            <ThemedText style={styles.historyText}><ThemedText style={styles.boldText}>Output:</ThemedText> {item.output}</ThemedText>
            <ThemedText style={styles.historyDate}>{item.date}</ThemedText>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
            <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
                <Text style={styles.clearButtonText}>Clear History</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    clearButton: {
        backgroundColor: '#ff6347',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    clearButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    historyItem: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    historyText: {
        fontSize: 16,
    },
    boldText: {
        fontWeight: 'bold',
    },
    historyDate: {
        fontSize: 12,
    },
});

export default HistoryScreen;
