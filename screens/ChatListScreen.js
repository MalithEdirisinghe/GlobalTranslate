import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '../components/ThemedText';
import { collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { auth, db } from './firebase';

const ChatListScreen = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const currentUser = auth.currentUser;
                const querySnapshot = await getDocs(collection(db, 'users'));
                const usersList = await Promise.all(querySnapshot.docs.map(async (doc) => {
                    const userData = doc.data();
                    const imageUrl = userData.imagePath ? await getProfilePictureUrl(userData.imagePath) : 'https://via.placeholder.com/50';
                    return { id: doc.id, ...userData, imageUrl };
                }));

                // Filter out the current user from the users list
                const filteredUsers = usersList.filter(user => user.id !== currentUser.uid);
                setUsers(filteredUsers);
            } catch (error) {
                console.error("Error fetching users: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const getProfilePictureUrl = async (imagePath) => {
        try {
            const storage = getStorage();
            const imageRef = ref(storage, imagePath);
            const url = await getDownloadURL(imageRef);
            return url;
        } catch (error) {
            console.error("Error fetching profile picture: ", error);
            return 'https://via.placeholder.com/50';
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.userItem, { backgroundColor: isDarkMode ? '#333' : '#D3D3D3' }]}
            onPress={() => navigation.navigate('Chat', { user: item })}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.userImage} />
            <ThemedText style={styles.userName}>{item.displayName}</ThemedText>
        </TouchableOpacity>

    );

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
                </View>
            ) : (
                <>
                    <Text style={styles.sectionTitle}>Other Users</Text>
                    <FlatList
                        data={users}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        margin: 15,
    },
    listContent: {
        paddingHorizontal: 15,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    userName: {
        fontSize: 16,
    },
});

export default ChatListScreen;
