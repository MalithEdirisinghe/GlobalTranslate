import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as Speech from 'expo-speech';

const API_KEY = 'AIzaSyC4e5GvHjW-WrlaZdoDXVRNg9AKRJ2uAWo';

const TranslateScreen = () => {
    const [inputLanguage, setInputLanguage] = useState('en');
    const [outputLanguage, setOutputLanguage] = useState('es');
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [languages, setLanguages] = useState([]);
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await axios.get(
                    `https://translation.googleapis.com/language/translate/v2/languages?key=${API_KEY}&target=en`
                );
                const languageData = response.data.data.languages.map(language => ({
                    code: language.language,
                    name: language.name
                }));
                setLanguages(languageData);
            } catch (error) {
                console.error(error);
            }
        };

        fetchLanguages();
    }, []);

    const handleTranslate = async () => {
        try {
            const response = await axios.post(
                `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
                {
                    q: inputText,
                    source: inputLanguage,
                    target: outputLanguage,
                    format: 'text'
                }
            );
            setTranslatedText(response.data.data.translations[0].translatedText);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSpeak = (text, language) => {
        Speech.speak(text, {
            language: language,
        });
    };

    const goToHistory = () => {
        navigation.navigate('History');
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
            <Text style={styles.title}>Translate</Text>

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={inputLanguage}
                    style={styles.picker}
                    onValueChange={(itemValue) => setInputLanguage(itemValue)}
                >
                    {languages.map((language) => (
                        <Picker.Item key={language.code} label={language.name} value={language.code} />
                    ))}
                </Picker>
            </View>

            <View style={styles.textInputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your words..."
                    value={inputText}
                    onChangeText={setInputText}
                />
                <TouchableOpacity onPress={() => handleSpeak(inputText, inputLanguage)}>
                    <Ionicons name="volume-high-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={outputLanguage}
                    style={styles.picker}
                    onValueChange={(itemValue) => setOutputLanguage(itemValue)}
                >
                    {languages.map((language) => (
                        <Picker.Item key={language.code} label={language.name} value={language.code} />
                    ))}
                </Picker>
            </View>

            <View style={styles.textInputContainer1}>
                <TextInput
                    style={styles.output}
                    placeholder="Translated words"
                    value={translatedText}
                    editable={false}
                />
                <TouchableOpacity onPress={() => handleSpeak(translatedText, outputLanguage)}>
                    <Ionicons name="volume-high-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleTranslate}>
                <Text style={styles.buttonText}>Translate</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.historyButton} onPress={goToHistory}>
                <Ionicons name="time-outline" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#0073e6',
    },
    pickerContainer: {
        backgroundColor: '#e0f7fa',
        borderRadius: 10,
        marginBottom: 20,
    },
    picker: {
        height: 50,
        width: '100%',
    },
    textInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#e0f7fa',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        backgroundColor: '#e0f7fa',
        marginBottom: 20,
    },
    textInputContainer1: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#f8bbd0',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        backgroundColor: '#f8bbd0',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        height: 100,
        textAlignVertical: 'top',
        color: '#000',
        fontWeight: '500'
    },
    output: {
        flex: 1,
        height: 100,
        textAlignVertical: 'top',
        color: '#000',
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#0073e6',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    historyButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 10,
        elevation: 3,
    },
});

export default TranslateScreen;