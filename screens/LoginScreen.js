import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, ToastAndroid, ScrollView, ActivityIndicator, useColorScheme } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import * as SecureStore from 'expo-secure-store';
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const colorScheme = useColorScheme();
    const iconColor = colorScheme === 'dark' ? 'white' : 'black';
    const isDarkMode = colorScheme === 'dark';

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    useEffect(() => {
        const tryAutoLogin = async () => {
            try {
                const storedEmail = await SecureStore.getItemAsync('email');
                const storedPassword = await SecureStore.getItemAsync('password');

                if (storedEmail && storedPassword) {
                    setEmail(storedEmail);
                    setPassword(storedPassword);
                    handleLogin();
                }
            } catch (error) {
                console.error('Error reading stored credentials:', error);
            }
        };

        tryAutoLogin();
    }, []);

    const saveCredentials = async (email, password) => {
        try {
            await SecureStore.setItemAsync('email', email);
            await SecureStore.setItemAsync('password', password);
        } catch (error) {
            console.error('Error saving credentials:', error);
        }
    };

    const handleLogin = () => {
        if (email.length === 0 || password.length === 0) {
            console.log('Please enter Email and Password');
            const value = "Please enter Email and Password";
            ToastAndroid.showWithGravityAndOffset(
                value,
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM,
                25,
                50
            );
        } else {
            setLoading(true);
            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    // User logged in successfully
                    console.log('Login Successful!');
                    const value = "Login Successful!";
                    ToastAndroid.showWithGravityAndOffset(
                        value,
                        ToastAndroid.SHORT,
                        ToastAndroid.BOTTOM,
                        25,
                        50
                    );
                    saveCredentials(email, password);
                    navigation.navigate('Homes');
                })

                .catch(error => {
                    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                        const value = "Incorrect Email or Password";
                        ToastAndroid.showWithGravityAndOffset(
                            value,
                            ToastAndroid.LONG,
                            ToastAndroid.BOTTOM,
                            25,
                            50
                        );
                    }
                    if (error.code === 'auth/too-many-requests') {
                        const value = "Login disabled due to many attempts. Reset password or retry later.";
                        ToastAndroid.showWithGravityAndOffset(
                            value,
                            ToastAndroid.LONG,
                            ToastAndroid.BOTTOM,
                            50,
                            50
                        );
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }

    const handleForgotPassword = () => {
        if (email.length === 0) {
            console.log('Please enter your email');
            const value = 'Please enter your email';
            ToastAndroid.showWithGravityAndOffset(
                value,
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM,
                25,
                50
            );
        } else {
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    console.log('Password reset email sent successfully!');
                    const value = 'Password reset email sent successfully. Check your email for instructions.';
                    ToastAndroid.showWithGravityAndOffset(
                        value,
                        ToastAndroid.LONG,
                        ToastAndroid.BOTTOM,
                        25,
                        50
                    );
                })
                .catch(error => {
                    console.error(error);
                    console.log('Failed to send password reset email.');
                    const value = 'Failed to send password reset email. Please try again later.';
                    ToastAndroid.showWithGravityAndOffset(
                        value,
                        ToastAndroid.SHORT,
                        ToastAndroid.BOTTOM,
                        25,
                        50
                    );
                });
        }
    }

    const handleRegister = () => {
        navigation.navigate('Register');
    };

    return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
            <Text style={styles.loginText}>Login</Text>
            <View style={styles.inputField}>
                <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        value={email}
                        onChangeText={text => setEmail(text)}
                />
            </View>
            <View style={[styles.inputField, { top: '50%' }]}>
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={text => setPassword(text)}
                />
            </View>
            <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
                    {showPassword ? (
                        <AntDesign name="eye" size={24} color={iconColor} />
                    ) : (
                        <Entypo name="eye-with-line" size={24} color={iconColor} />
                    )}
            </TouchableOpacity>
            {/* Login Button */}
                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                            <Text style={styles.buttonText}>Login</Text>
                    )}
            </TouchableOpacity>
            {/* Forgot Password */}
                <TouchableOpacity onPress={handleForgotPassword}>
                <ThemedText type='defaultSemiBold' style={styles.forgotPassword}>Forgot Password?</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.loginLink} onPress={handleRegister}>
                    <Text style={styles.loginLinkText}>Don't have an account? Register</Text>
                </TouchableOpacity>
            <Image
                source={require('../assets/logo.png')}
                style={styles.logo}
            />
        </View>
        </ScrollView >
    );
};

const styles = StyleSheet.create({
    scrollViewContent: {
        flexGrow: 1,
    },
    container: {
        position: 'relative',
        width: 'auto',
        height: 870,
    },
    loginText: {
        position: 'absolute',
        fontSize: 40,
        fontWeight: '600',
        color: '#2CA8ED',
        top: '25%',
        alignSelf: 'center',
    },
    inputField: {
        position: 'absolute',
        width: 328,
        height: 50,
        alignSelf: 'center',
        top: '40%'
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(202, 210, 203, 0.75)',
        borderRadius: 8,
        paddingLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#081C15',
        borderRadius: 8,
        paddingLeft: 10,
        borderColor: 'gray',
        borderWidth: 1,
    },
    button: {
        position: 'absolute',
        width: 328,
        height: 56,
        backgroundColor: '#47B6E5',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        top: '70%',
        alignSelf: 'center'
    },
    buttonText: {
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 24,
        color: '#FFFFFF',
    },
    forgotPassword: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 17,
        top: '3100%',
        alignSelf: 'center'
    },
    logo: {
        position: 'absolute',
        width: 301,
        height: 195,
        top: 40,
        alignSelf: 'center'
    },
    eyeIcon: {
        position: 'absolute',
        right: '10%',
        bottom: '45.5%'
    },
    loginLink: {
        alignSelf: 'center',
        top: '80%'
    },
    loginLinkText: {
        color: 'blue',
        fontSize: 16
    },
});

export default LoginScreen;
