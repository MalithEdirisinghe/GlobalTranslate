import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, GestureResponderEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

const Welcome = ({}) => {
    const navigation = useNavigation();

    const handleLogin = () => {
        navigation.navigate('Login');
    }
    const handleRegister = () => {
        navigation.navigate('Register');
    }


    return (
        <ThemedView style={styles.container}>
            <Text style={styles.title}>Welcome</Text>
            <Image
                source={require('../assets/logo.png')}
                style={styles.logo}
            />
            <TouchableOpacity style={styles.secondaryButton} onPress={handleRegister}>
                <Text style={[styles.buttonText, { color: '#5DBAE2' }]}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <ThemedText type="defaultSemiBold" style={styles.haveAccount}>You don't have an account?</ThemedText>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        height: '120%',
    },
    title: {
        position: 'absolute',
        width: 215,
        height: 53,
        fontSize: 44,
        fontWeight: '600',
        lineHeight: 53,
        textAlign: 'center',
        color: '#2CA8ED',
        top: '40%',
        alignSelf: 'center'
    },
    logo: {
        position: 'absolute',
        width: 301,
        height: 195,
        top: 184,
        alignSelf: 'center',
    },
    primaryButton: {
        position: 'absolute',
        width: 328,
        height: 56,
        backgroundColor: '#47B6E6',
        borderRadius: 8,
        top: '50%',
        alignSelf: 'center',
    },
    secondaryButton: {
        position: 'absolute',
        width: 328,
        height: 56,
        borderWidth: 4,
        borderColor: '#47B6E5',
        borderRadius: 8,
        top: '65%',
        alignSelf: 'center',
    },
    buttonText: {
        fontSize: 25,
        fontWeight: '700',
        lineHeight: 45,
        textAlign: 'center',
        color: '#FFFFFF',
    },
    haveAccount: {
        position: 'absolute',
        width: 175,
        height: 17,
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 17,
        textAlign: 'center',
        top: '60%',
        alignSelf: 'center'
    },
});

export default Welcome;
