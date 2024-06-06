import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, useColorScheme, TouchableOpacity, ActivityIndicator } from 'react-native';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, deleteDoc, writeBatch, doc } from 'firebase/firestore';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '../components/ThemedText';

const parseDateString = (dateString) => {
    const [datePart, timePart] = dateString.split(', ');
    const [day, month, year] = datePart.split('/');
    return new Date(`${year}-${month}-${day}T${timePart}`);
};

const HistoryScreen = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const navigation = useNavigation();

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const q = query(collection(db, 'translationHistory'), where('userId', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    // Parse and sort historyData by date in descending order
                    historyData.sort((a, b) => parseDateString(b.date) - parseDateString(a.date));
                    setHistory(historyData);
                }
            } catch (error) {
                console.error('Error loading translation history:', error);
            } finally {
                setLoading(false);
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
                querySnapshot.forEach(docSnapshot => {
                    batch.delete(doc(db, 'translationHistory', docSnapshot.id));
                });
                await batch.commit();

                setHistory([]);
            }
        } catch (error) {
            console.error('Error clearing translation history:', error);
        }
    };

    const deleteHistoryItem = async (itemId) => {
        try {
            const user = auth.currentUser;
            if (user) {
                await deleteDoc(doc(db, 'translationHistory', itemId));
                setHistory((prevHistory) => prevHistory.filter(item => item.id !== itemId));
            }
        } catch (error) {
            console.error('Error deleting translation history item:', error);
        }
    };

    const renderItem = ({ item }) => (
        <Swipeable
            renderRightActions={() => (
                <View style={styles.underlay}>
                    <TouchableOpacity onPress={() => deleteHistoryItem(item.id)}>
                        <Text style={styles.underlayText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            )}
        >
            <TouchableOpacity
                onPress={() => navigation.navigate('Translate', {
                    inputText: item.input,
                    inputLanguage: item.inputLanguage,
                    outputLanguage: item.outputLanguage,
                })}
            >
                <View style={[styles.historyItem, { backgroundColor: isDarkMode ? '#333' : '#D3D3D3' }]}>
                    <ThemedText style={styles.historyText}><ThemedText style={styles.boldText}>Input:</ThemedText> {item.input}</ThemedText>
                    <ThemedText style={styles.historyText}><ThemedText style={styles.boldText}>Output:</ThemedText> {item.output}</ThemedText>
                    <ThemedText style={styles.historyDate}>{item.date}</ThemedText>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : '#E0F7FA' }]}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
                </View>
            ) : (
                history.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No translation history available</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={history}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                        />
                        <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
                            <Text style={styles.clearButtonText}>Clear All History</Text>
                        </TouchableOpacity>
                    </>
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: 'gray',
    },
    clearButton: {
        backgroundColor: '#ff6347',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        top: '2%',
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
    underlay: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        backgroundColor: '#ff6347',
        padding: 20,
        borderRadius: 10,
    },
    underlayText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default HistoryScreen;
