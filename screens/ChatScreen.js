import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image, useColorScheme, Modal, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '../components/ThemedText';
import { auth, db } from './firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import axios from 'axios';
import moment from 'moment';

const API_KEY = 'AIzaSyC4e5GvHjW-WrlaZdoDXVRNg9AKRJ2uAWo';
const languages = [
    { code: 'en', name: 'English' },
    { code: 'si', name: 'Sinhala' },
    { code: 'ta', name: 'Tamil' },
    { code: 'hi', name: 'Hindi' },
    { code: 'zh', name: 'Chinese' },
    { code: 'fr', name: 'French' }
];

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
    const navigation = useNavigation();
    const route = useRoute();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const flatListRef = useRef(null);

    const user = route.params?.user || {};
    const currentUser = auth.currentUser;
    const updateChatList = route.params?.updateChatList;

    useEffect(() => {
        const messagesRef = collection(db, 'messages');
        if (!currentUser?.uid || !user?.id) return;

        const q = query(
            messagesRef,
            where('senderId', 'in', [currentUser.uid, user.id]),
            where('receiverId', 'in', [currentUser.uid, user.id]),
            orderBy('timestamp')
        );

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const messagesList = await Promise.all(querySnapshot.docs.map(async (doc) => {
                const data = doc.data();
                if (data.senderId !== currentUser.uid && data.language !== selectedLanguage.code) {
                    data.text = await translateMessage(data.text, data.language, selectedLanguage.code);
                }
                return { id: doc.id, ...data };
            }));
            setMessages(messagesList);
            flatListRef.current?.scrollToEnd({ animated: true });
        });

        return () => unsubscribe();
    }, [user.id, currentUser?.uid, selectedLanguage]);

    const translateMessage = async (text, sourceLanguage, targetLanguage) => {
        if (sourceLanguage === targetLanguage) {
            return text;
        }

        try {
            const response = await axios.post(
                `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
                {
                    q: text,
                    source: sourceLanguage,
                    target: targetLanguage,
                    format: 'text',
                }
            );
            return response.data.data.translations[0].translatedText;
        } catch (error) {
            console.error('Error translating message:', error.response ? error.response.data : error.message);
            return text;
        }
    };

    const sendMessage = async () => {
        if (inputText.trim()) {
            setInputText('');
            try {
                const message = {
                    text: inputText,
                    senderId: currentUser.uid,
                    receiverId: user.id,
                    timestamp: new Date(),
                    sent: true,
                    delivered: false,
                    read: false,
                    language: selectedLanguage.code,
                };

                const docRef = await addDoc(collection(db, 'messages'), message);

                // Update the message to mark as delivered
                await updateDoc(doc(db, 'messages', docRef.id), { delivered: true });

                // Bring the recipient user to the top of the list
                if (updateChatList) {
                    updateChatList(user.id);
                }
            } catch (error) {
                console.error('Error sending message: ', error);
            }
        }
    };

    const markMessageAsRead = async (message) => {
        if (!message.read && message.receiverId === currentUser.uid) {
            await updateDoc(doc(db, 'messages', message.id), { read: true });
        }
    };

    const renderMessageStatus = (message) => {
        if (message.read) {
            return <MaterialIcons name="done-all" size={16} color="blue" />; // read
        } else if (message.delivered) {
            return <MaterialIcons name="done-all" size={16} color="gray" />; // delivered
        } else if (message.sent) {
            return <MaterialIcons name="done" size={16} color="gray" />; // sent
        }
        return null;
    };

    const renderItem = ({ item }) => {
        // Mark message as read if it is rendered and the receiver is the current user
        if (!item.read && item.receiverId === currentUser.uid) {
            markMessageAsRead(item);
        }

        return (
            <View style={[styles.messageContainer, item.senderId === currentUser.uid ? styles.selfMessage : styles.otherMessage]}>
                <Text style={styles.messageText}>{item.text}</Text>
                <Text style={styles.messageTime}>{moment(item.timestamp.toDate()).format('HH:mm')}</Text>
                {item.senderId === currentUser.uid && (
                    <View style={styles.messageStatusContainer}>
                        {renderMessageStatus(item)}
                    </View>
                )}
            </View>
        );
    };

    const handleLanguageSelect = (language) => {
        setSelectedLanguage(language);
        setModalVisible(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : '#E0F7FA' }]}>
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
            <TouchableOpacity style={styles.languageButton} onPress={() => setModalVisible(true)}>
                <ThemedText style={styles.languageButtonText}>Select Language ({selectedLanguage.name})</ThemedText>
                <AntDesign name="downcircle" size={18} color="#47B6E5" />
            </TouchableOpacity>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                style={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {languages.map(language => (
                            <TouchableOpacity key={language.code} style={styles.modalItem} onPress={() => handleLanguageSelect(language)}>
                                <Text style={styles.modalItemText}>{language.name}</Text>
                            </TouchableOpacity>
                        ))}
                        <Button title="Close" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
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
        maxWidth: '80%',
        borderRadius: 10,
        padding: 10,
        marginVertical: 10,
        position: 'relative',
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
        textAlign: 'left',
        right: 5,
    },
    messageTime: {
        fontSize: 12,
        color: '#888',
        alignSelf: 'flex-end',
        marginTop: 5,
        left: 6 
    },
    messageStatusContainer: {
        position: 'absolute',
        right: 1,
        bottom: 0,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    modalItemText: {
        fontSize: 18,
    },
});

export default ChatScreen;