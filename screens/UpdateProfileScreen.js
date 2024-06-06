import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged, updateEmail, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';  // Adjust the path according to your project structure
import { ThemedText } from '../components/ThemedText';
import * as ImagePicker from 'expo-image-picker';

const UpdateProfileScreen = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
    const [newProfileImage, setNewProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const auth = getAuth();
    const iconColor = colorScheme === 'dark' ? 'white' : 'black';

    useEffect(() => {
        const fetchUserData = async (user) => {
            try {
                setEmail(user.email);
                setUsername(user.displayName);

                const profileImageRef = ref(storage, `user_images/${user.uid}.jpeg`);
                const url = await getDownloadURL(profileImageRef);
                setProfileImage(url);
            } catch (error) {
                console.error('Error fetching user data: ', error);
                setProfileImage('https://via.placeholder.com/150');
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchUserData(user);
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            const { uri } = result.assets[0];
            setNewProfileImage(uri);
            setProfileImage(uri);
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("User not authenticated");
            const userDocRef = doc(db, 'users', user.uid);

            // Update profile image if a new one is selected
            if (newProfileImage) {
                const response = await fetch(newProfileImage);
                const blob = await response.blob();
                const fileRef = ref(storage, `user_images/${user.uid}.jpeg`);
                await uploadBytes(fileRef, blob);
                const url = await getDownloadURL(fileRef);
                await updateDoc(doc(db, 'users', user.uid), { profileImage: `user_images/${user.uid}.jpeg` });
                setProfileImage(url);
                // await updateDoc(userDocRef, {
                //     profileImage: email,
                // });
            }

            // Update email in Firebase Authentication if it has changed
            if (email !== user.email) {
                await updateEmail(user, email);
                await updateDoc(userDocRef, {
                    email: email,
                });
            }

            // Update display name in Firebase Authentication if it has changed
            if (username !== user.displayName) {
                await updateProfile(user, { displayName: username });
                await updateDoc(userDocRef, {
                    displayName: username,
                });
            }
            
            Alert.alert("Profile updated successfully");
        } catch (error) {
            console.error("Error updating profile: ", error);
            Alert.alert("Error updating profile", error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
                <ActivityIndicator size="large" color="#2CA8ED" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : '#E0F7FA' }]}>
            <View style={styles.profileContainer}>
                <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                />
                <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
                    <AntDesign name="camera" size={24} color={iconColor} />
                </TouchableOpacity>
            </View>
            <ThemedText style={styles.profileName}>{username}</ThemedText>

            <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    keyboardType="email-address"
                />
            </View>

            <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Username</ThemedText>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Username"
                />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                <Text style={styles.saveButtonText}>Update</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    cameraIcon: {
        position: 'absolute',
        right: 0,
        bottom: '80%',
    },
    profileName: {
        marginTop: 10,
        fontSize: 20,
        fontWeight: 'bold',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 15,
    },
    label: {
        marginBottom: 5,
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#d4dcd5',
        fontSize: 16,
    },
    saveButton: {
        width: '100%',
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#47B6E5',
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default UpdateProfileScreen;
