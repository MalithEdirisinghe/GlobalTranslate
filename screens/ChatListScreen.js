import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '../components/ThemedText';
import { collection, query, where, onSnapshot, getDocs, doc } from 'firebase/firestore';
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
                if (!currentUser) {
                    throw new Error("No current user");
                }
                const querySnapshot = await getDocs(collection(db, 'users'));
                const usersList = await Promise.all(querySnapshot.docs.map(async (doc) => {
                    const userData = doc.data();
                    const imageUrl = userData.imagePath ? await getProfilePictureUrl(userData.imagePath) : 'https://via.placeholder.com/50';
                    return { id: doc.id, ...userData, imageUrl, unreadCount: 0 };
                }));

                // Filter out the current user from the users list
                const filteredUsers = usersList.filter(user => user.id !== currentUser.uid);
                setUsers(filteredUsers);

                // Set up real-time listener for unread messages and online status
                filteredUsers.forEach(user => {
                    setupUnreadMessagesListener(currentUser.uid, user.id);
                    setupOnlineStatusListener(user.id);
                });
            } catch (error) {
                console.error("Error fetching users: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const setupUnreadMessagesListener = (currentUserId, otherUserId) => {
        if (!currentUserId || !otherUserId) return;

        const messagesRef = collection(db, 'messages');
        const q = query(
            messagesRef,
            where('receiverId', '==', currentUserId),
            where('senderId', '==', otherUserId),
            where('read', '==', false)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const unreadCount = querySnapshot.size;
            setUsers(prevUsers => {
                const updatedUsers = prevUsers.map(user =>
                    user.id === otherUserId
                        ? { ...user, unreadCount }
                        : user
                );

                // Move the user with the new message to the top
                const userWithNewMessage = updatedUsers.find(user => user.id === otherUserId);
                if (userWithNewMessage) {
                    const withoutUser = updatedUsers.filter(user => user.id !== otherUserId);
                    return [userWithNewMessage, ...withoutUser];
                }

                return updatedUsers;
            });
        });

        return unsubscribe;
    };

    const setupOnlineStatusListener = (userId) => {
        const userRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
            const userData = docSnapshot.data();
            setUsers(prevUsers => {
                return prevUsers.map(user =>
                    user.id === userId
                        ? { ...user, online: userData.online }
                        : user
                );
            });
        });

        return unsubscribe;
    };

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

    const updateChatList = (userId) => {
        setUsers(prevUsers => {
            const userToMove = prevUsers.find(user => user.id === userId);
            const remainingUsers = prevUsers.filter(user => user.id !== userId);
            return [userToMove, ...remainingUsers];
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.userItem, { backgroundColor: isDarkMode ? '#333' : '#D3D3D3' }]}
            onPress={() => navigation.navigate('Chat', { user: item, updateChatList })}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.userImage} />
            <View style={styles.userInfo}>
                <ThemedText style={styles.userName}>{item.displayName}</ThemedText>
                {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                    </View>
                )}
                {item.online && (
                    <View style={styles.onlineDot} />
                )}
            </View>
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
                    <ThemedText style={styles.sectionTitle}>Other Users</ThemedText>
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
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
    },
    unreadBadge: {
        backgroundColor: 'red',
        borderRadius: 12,
        marginLeft: 10,
        paddingVertical: 2,
        paddingHorizontal: 6,
    },
    unreadCount: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    onlineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'green',
        marginLeft: 10,
    },
});

export default ChatListScreen;
