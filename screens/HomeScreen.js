import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, useColorScheme, BackHandler } from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { auth, storage } from './firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';

import { Entypo } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

const HomeScreen = () => {
    const colorScheme = useColorScheme();
    const iconColor = colorScheme === 'dark' ? 'white' : 'black';
    const isDarkMode = colorScheme === 'dark';

    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const backAction = () => {
            BackHandler.exitApp();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    setDisplayName(user.displayName || 'Anonymous');

                    const profileImageRef = ref(storage, `user_images/${user.uid}.jpeg`);
                    const url = await getDownloadURL(profileImageRef);
                    setProfileImageUrl(url);
                }
            } catch (error) {
                console.error('Error fetching profile image:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigation.replace('Login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const confirmLogout = () => {
        setModalVisible(true);
    };

    const cancelLogout = () => {
        setModalVisible(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2CA8ED" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
            <View style={styles.profileContainer}>
                <Image
                    source={{ uri: profileImageUrl || 'https://via.placeholder.com/150' }}
                    style={styles.profileImage}
                />
                <ThemedText style={styles.nameText}>{displayName}</ThemedText>
                <ThemedText style={styles.welcomeText}>Welcome to</ThemedText>
                <ThemedText style={styles.companyText}>GlobalTranslate</ThemedText>
            </View>

            <ThemedText style={styles.optionsTitle}>Options</ThemedText>

            <View style={styles.optionsContainer}>
                <TouchableOpacity style={styles.optionButton}>
                    <FontAwesome name="language" size={24} color={iconColor} />
                    <ThemedText style={styles.optionText}>Translate</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton}>
                    <Ionicons name="game-controller" size={24} color={iconColor} />
                    <ThemedText style={styles.optionText}>Game</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton}>
                    <Entypo name="chat" size={24} color={iconColor} />
                    <ThemedText style={styles.optionText}>Chat</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton} onPress={confirmLogout}>
                    <MaterialCommunityIcons name="logout" size={24} color={iconColor} />
                    <ThemedText style={styles.optionText}>Logout</ThemedText>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={cancelLogout}
            >
                <View style={styles.modalContainer}>
                    <ThemedView style={styles.modalContent}>
                        <ThemedText style={styles.modalText}>Are you sure you want to logout?</ThemedText>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={cancelLogout}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                <Text style={styles.logoutButtonText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </ThemedView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(44, 168, 237, 0.3)',
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2CA8ED',
        marginBottom: 30,
        width: '80%',
        height: '50%',
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 10,
    },
    nameText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    welcomeText: {
        fontSize: 18,
        marginBottom: 5,
        top: '10%',
    },
    companyText: {
        fontSize: 20,
        fontWeight: 'bold',
        top: '10%',
    },
    optionsTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 10,
        right: '25%',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '80%',
    },
    optionButton: {
        backgroundColor: 'rgba(44, 168, 237, 0.3)',
        padding: 20,
        borderRadius: 10,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '40%',
    },
    optionText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        // backgroundColor: '#e6f3ff',
        padding: 40,
        // borderRadius: 10,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        alignItems: 'center',
        width: '100%',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        backgroundColor: '#ff4d4d',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#4da6ff',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default HomeScreen;