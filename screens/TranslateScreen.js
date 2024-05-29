import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, ScrollView, RefreshControl, ToastAndroid, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { auth, db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

const API_KEY = 'AIzaSyC4e5GvHjW-WrlaZdoDXVRNg9AKRJ2uAWo';
const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;
const SPEECH_API_URL = `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`;

const TranslateScreen = () => {
    const [inputLanguage, setInputLanguage] = useState('en');
    const [outputLanguage, setOutputLanguage] = useState('es');
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const [recording, setRecording] = useState(null);
    const [imageUri, setImageUri] = useState(null);
    const navigation = useNavigation();
    const route = useRoute();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const iconColor = colorScheme === 'dark' ? 'white' : 'black';

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'si', name: 'Sinhala' },
        { code: 'ta', name: 'Tamil' },
        { code: 'hi', name: 'Hindi' },
        { code: 'zh', name: 'Chinese' },
        { code: 'fr', name: 'French' }
    ];

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();

        if (route.params) {
            const { inputText, inputLanguage, outputLanguage } = route.params;
            setInputText(inputText);
            setInputLanguage(inputLanguage);
            setOutputLanguage(outputLanguage);
        }
    }, [route.params]);

    const handleTranslate = async () => {
        if (!inputText.trim()) {
            ToastAndroid.show('Please enter the words', ToastAndroid.SHORT);
            return;
        }

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
            const translated = response.data.data.translations[0].translatedText;
            setTranslatedText(translated);
            saveTranslationHistory(inputText, translated);
        } catch (error) {
            console.error(error);
        }
    };

    const saveTranslationHistory = async (input, output) => {
        try {
            const user = auth.currentUser;
            if (user) {
                const historyItem = {
                    input,
                    output,
                    inputLanguage,
                    outputLanguage,
                    date: new Date().toLocaleString(),
                    userId: user.uid
                };
                await addDoc(collection(db, 'translationHistory'), historyItem);
            }
        } catch (error) {
            console.error('Error saving translation history:', error);
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

    const onRefresh = () => {
        setInputText('');
        setTranslatedText('');
        setRefreshing(false);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            performTextRecognition(result.assets[0].uri);
        } else {
            console.log('Image selection was cancelled');
        }
    };

    const performTextRecognition = async (uri) => {
        if (!uri) {
            console.error('No image URI found');
            return;
        }

        try {
            const base64Image = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            const response = await axios.post(VISION_API_URL, {
                requests: [
                    {
                        image: {
                            content: base64Image,
                        },
                        features: [
                            {
                                type: 'TEXT_DETECTION',
                            },
                        ],
                    },
                ],
            });

            const detectedText = response.data.responses[0].fullTextAnnotation.text;
            setInputText(detectedText);
        } catch (err) {
            console.error('Error recognizing text from image:', err);
        }
    };

    const startRecording = async () => {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            );

            setRecording(recording);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        setRecording(undefined);
        await recording.stopAndUnloadAsync();

        const uri = recording.getURI();
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

            try {
                const response = await fetch('https://us-central1-globaltranslate.cloudfunctions.net/function-1', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ audioBase64: base64Audio }),
                });
                console.log('response: ', response);

                if (!response.ok) {
                    throw new Error('Failed to send audio to Cloud Function');
                }

                const result = await response.text();
                console.log(result);
            } catch (error) {
                console.error('Error:', error.message);
            }

        try {
            const response = await axios.post(SPEECH_API_URL, {
                config: {
                    "encoding": "FLAC",
                    "sampleRateHertz": 8000,
                    "languageCode": inputLanguage,
                    "enableWordTimeOffsets": false
                },
                audio: {
                    "uri": "gs://global_translate/audio.flac"
                },
            });

            if (response.data && response.data.results && response.data.results.length > 0) {
                const detectedText = response.data.results[0].alternatives[0].transcript;
                setInputText(detectedText);
                console.log('Text: ', detectedText);
            } else {
                console.error('No transcription found in response');
            }
        } catch (err) {
            console.error('Error recognizing speech from audio:', err);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={[styles.innerContainer, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
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
                        multiline={true}
                    />
                    <TouchableOpacity onPress={() => handleSpeak(inputText, inputLanguage)}>
                        <Ionicons name="volume-high-outline" size={24} color={iconColor} />
                    </TouchableOpacity>
                </View>


                <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                    <Ionicons name="camera-outline" size={60} color={iconColor} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.voiceButton}
                    onPress={recording ? stopRecording : startRecording}
                >
                    <Ionicons
                        name={recording ? 'stop-circle-outline' : 'mic-outline'}
                        size={60}
                        color={iconColor}
                    />
                </TouchableOpacity>

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
                    <ScrollView style={{ flex: 1 }}>
                        <TextInput
                            style={styles.output}
                            placeholder="Translated words"
                            value={translatedText}
                            editable={false}
                            multiline={true}
                        />
                    </ScrollView>
                    <TouchableOpacity onPress={() => handleSpeak(translatedText, outputLanguage)}>
                        <Ionicons name="volume-high-outline" size={24} color={iconColor} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleTranslate}>
                    <Text style={styles.buttonText}>Translate</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.historyButton} onPress={goToHistory}>
                    <Ionicons name="time-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    innerContainer: {
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
        textAlignVertical: 'top',
        color: '#000',
        fontWeight: '500',
    },
    voiceButton: {
        alignItems: 'center',
        bottom: '5%',
        left: '30%',
    },
    cameraButton: {
        alignItems: 'center',
        right: '30%',
        top: '5%'
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
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 10,
        elevation: 3,
        alignItems: 'center',
        marginTop: 10,
        width: 45,
        alignSelf: 'flex-end'
    },
});

export default TranslateScreen;
