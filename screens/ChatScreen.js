import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { ThemedText } from '../components/ThemedText';

const messagesData = [
    { id: '1', text: 'Hi', sender: 'other' },
    { id: '2', text: 'Hi', sender: 'self' },
    { id: '3', text: 'How are you?', sender: 'self' },
    { id: '4', text: 'I am good.', sender: 'other' },
];

const ChatScreen = () => {
    const [messages, setMessages] = useState(messagesData);
    const [inputText, setInputText] = useState('');
    const navigation = useNavigation();
    const route = useRoute();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const user = route.params?.user || {};  // Use optional chaining and provide a default value

    const sendMessage = () => {
        if (inputText.trim()) {
            setMessages([...messages, { id: Date.now().toString(), text: inputText, sender: 'self' }]);
            setInputText('');
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.messageContainer, item.sender === 'self' ? styles.selfMessage : styles.otherMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.arrow}>
                    <AntDesign name="arrowleft" size={24} color="white" />
                </TouchableOpacity>
                {user.imageUrl ? (
                    <Image source={{ uri: user.imageUrl }} style={styles.userImage} />
                ) : (
                    <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.userImage} />
                )}
                <ThemedText style={styles.headerTitle}>{user.displayName || 'User'}</ThemedText>
            </View>
            <TouchableOpacity style={styles.languageButton}>
                <ThemedText style={styles.languageButtonText}>Select Language</ThemedText>
                <AntDesign name="downcircle" size={18} color="#47B6E5" />
            </TouchableOpacity>
            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                style={styles.messagesList}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    value={inputText}
                    onChangeText={setInputText}
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                    <AntDesign name="arrowright" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#47B6E5',
        padding: 25,
    },
    arrow: {
        top: '5%'
    },
    userImage: {
        width: 45,
        height: 45,
        borderRadius: 25,
        marginHorizontal: 10,
        top: '5%'
    },
    headerTitle: {
        fontSize: 18,
        color: 'white',
        top: '5%'
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#47B6E5',
        padding: 10,
        margin: 10,
        borderRadius: 20,
    },
    languageButtonText: {
        color: 'white',
        marginRight: 5,
    },
    messagesList: {
        flex: 1,
        padding: 10,
    },
    messageContainer: {
        maxWidth: '70%',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
    },
    selfMessage: {
        backgroundColor: '#ADD8E6',
        alignSelf: 'flex-end',
    },
    otherMessage: {
        backgroundColor: '#E6E6FA',
        alignSelf: 'flex-start',
    },
    messageText: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#E0E0E0',
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 10,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    sendButton: {
        backgroundColor: '#47B6E5',
        borderRadius: 20,
        padding: 10,
    },
});

export default ChatScreen;
