
// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, ScrollView, RefreshControl, ToastAndroid } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { Picker } from '@react-native-picker/picker';
// import axios from 'axios';
// import * as Speech from 'expo-speech';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_KEY = 'AIzaSyC4e5GvHjW-WrlaZdoDXVRNg9AKRJ2uAWo';

// const TranslateScreen = () => {
//     const [inputLanguage, setInputLanguage] = useState('en');
//     const [outputLanguage, setOutputLanguage] = useState('es');
//     const [inputText, setInputText] = useState('');
//     const [translatedText, setTranslatedText] = useState('');
//     const [languages, setLanguages] = useState([]);
//     const [refreshing, setRefreshing] = useState(false);
//     const navigation = useNavigation();
//     const colorScheme = useColorScheme();
//     const isDarkMode = colorScheme === 'dark';

//     useEffect(() => {
//         const fetchLanguages = async () => {
//             try {
//                 const response = await axios.get(
//                     `https://translation.googleapis.com/language/translate/v2/languages?key=${API_KEY}&target=en`
//                 );
//                 const languageData = response.data.data.languages.map(language => ({
//                     code: language.language,
//                     name: language.name
//                 }));
//                 setLanguages(languageData);
//             } catch (error) {
//                 console.error(error);
//             }
//         };

//         fetchLanguages();
//     }, []);

//     const handleTranslate = async () => {
//         if (!inputText.trim()) {
//             ToastAndroid.show('Please enter the words', ToastAndroid.SHORT);
//             return;
//         }

//         try {
//             const response = await axios.post(
//                 `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
//                 {
//                     q: inputText,
//                     source: inputLanguage,
//                     target: outputLanguage,
//                     format: 'text'
//                 }
//             );
//             const translated = response.data.data.translations[0].translatedText;
//             setTranslatedText(translated);
//             saveTranslationHistory(inputText, translated);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     const saveTranslationHistory = async (input, output) => {
//         try {
//             const historyItem = {
//                 input,
//                 output,
//                 inputLanguage,
//                 outputLanguage,
//                 date: new Date().toLocaleString()
//             };
//             const existingHistory = await AsyncStorage.getItem('translationHistory');
//             const history = existingHistory ? JSON.parse(existingHistory) : [];
//             history.push(historyItem);
//             await AsyncStorage.setItem('translationHistory', JSON.stringify(history));
//         } catch (error) {
//             console.error('Error saving translation history:', error);
//         }
//     };

//     const handleSpeak = (text, language) => {
//         Speech.speak(text, {
//             language: language,
//         });
//     };

//     const goToHistory = () => {
//         navigation.navigate('History');
//     };

//     const onRefresh = () => {
//         setInputText('');
//         setTranslatedText('');
//         setRefreshing(false);
//     };

//     return (
//         <ScrollView
//             contentContainerStyle={styles.container}
//             refreshControl={
//                 <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//             }
//         >
//             <View style={[styles.innerContainer, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
//                 <Text style={styles.title}>Translate</Text>

//                 <View style={styles.pickerContainer}>
//                     <Picker
//                         selectedValue={inputLanguage}
//                         style={styles.picker}
//                         onValueChange={(itemValue) => setInputLanguage(itemValue)}
//                     >
//                         {languages.map((language) => (
//                             <Picker.Item key={language.code} label={language.name} value={language.code} />
//                         ))}
//                     </Picker>
//                 </View>

//                 <View style={styles.textInputContainer}>
//                     <TextInput
//                         style={styles.input}
//                         placeholder="Enter your words..."
//                         value={inputText}
//                         onChangeText={setInputText}
//                         multiline={true}
//                     />
//                     <TouchableOpacity onPress={() => handleSpeak(inputText, inputLanguage)}>
//                         <Ionicons name="volume-high-outline" size={24} color="black" />
//                     </TouchableOpacity>
//                 </View>

//                 <View style={styles.pickerContainer}>
//                     <Picker
//                         selectedValue={outputLanguage}
//                         style={styles.picker}
//                         onValueChange={(itemValue) => setOutputLanguage(itemValue)}
//                     >
//                         {languages.map((language) => (
//                             <Picker.Item key={language.code} label={language.name} value={language.code} />
//                         ))}
//                     </Picker>
//                 </View>

//                 <View style={styles.textInputContainer1}>
//                     <ScrollView style={{ flex: 1 }}>
//                         <TextInput
//                             style={styles.output}
//                             placeholder="Translated words"
//                             value={translatedText}
//                             editable={false}
//                             multiline={true}
//                         />
//                     </ScrollView>
//                     <TouchableOpacity onPress={() => handleSpeak(translatedText, outputLanguage)}>
//                         <Ionicons name="volume-high-outline" size={24} color="black" />
//                     </TouchableOpacity>
//                 </View>

//                 <TouchableOpacity style={styles.button} onPress={handleTranslate}>
//                     <Text style={styles.buttonText}>Translate</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.historyButton} onPress={goToHistory}>
//                     <Ionicons name="time-outline" size={24} color="black" />
//                 </TouchableOpacity>
//             </View>
//         </ScrollView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flexGrow: 1,
//     },
//     innerContainer: {
//         flex: 1,
//         padding: 20,
//         justifyContent: 'flex-start',
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         textAlign: 'center',
//         marginBottom: 20,
//         color: '#0073e6',
//     },
//     pickerContainer: {
//         backgroundColor: '#e0f7fa',
//         borderRadius: 10,
//         marginBottom: 20,
//     },
//     picker: {
//         height: 50,
//         width: '100%',
//     },
//     textInputContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderColor: '#e0f7fa',
//         borderWidth: 1,
//         borderRadius: 10,
//         padding: 10,
//         backgroundColor: '#e0f7fa',
//         marginBottom: 20,
//     },
//     textInputContainer1: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderColor: '#f8bbd0',
//         borderWidth: 1,
//         borderRadius: 10,
//         padding: 10,
//         backgroundColor: '#f8bbd0',
//         marginBottom: 20,
//     },
//     input: {
//         flex: 1,
//         height: 100,
//         textAlignVertical: 'top',
//         color: '#000',
//         fontWeight: '500'
//     },
//     output: {
//         flex: 1,
//         textAlignVertical: 'top',
//         color: '#000',
//         fontWeight: '500',
//     },
//     button: {
//         backgroundColor: '#0073e6',
//         padding: 15,
//         borderRadius: 10,
//         alignItems: 'center',
//         marginBottom: 10,
//     },
//     buttonText: {
//         color: '#fff',
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
//     historyButton: {
//         backgroundColor: '#fff',
//         borderRadius: 30,
//         padding: 10,
//         elevation: 3,
//         alignItems: 'center',
//         marginTop: 10,
//         width: 45,
//         alignSelf: 'flex-end'
//     },
// });

// export default TranslateScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, ScrollView, RefreshControl, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as Speech from 'expo-speech';
import { auth, db } from './firebase'; // Adjust the path to your firebase.js
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const API_KEY = 'AIzaSyC4e5GvHjW-WrlaZdoDXVRNg9AKRJ2uAWo';

const TranslateScreen = () => {
    const [inputLanguage, setInputLanguage] = useState('en');
    const [outputLanguage, setOutputLanguage] = useState('es');
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [languages, setLanguages] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
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
