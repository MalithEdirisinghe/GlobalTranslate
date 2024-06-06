
// import React, { useState, useCallback } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Modal, ToastAndroid } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import RNPickerSelect from 'react-native-picker-select';
// import { ThemedText } from '../components/ThemedText';
// import { AntDesign } from '@expo/vector-icons';

// const words = [
//     { id: '1', en: 'Hello', si: 'හෙලෝ', ta: 'வணக்கம்', hi: 'नमस्ते', zh: '你好', fr: 'Bonjour' },
//     { id: '2', en: 'Goodbye', si: 'ගුඩ්බයි', ta: 'பிரியாவிடை', hi: 'अलविदा', zh: '再见', fr: 'Au revoir' },
//     { id: '3', en: 'Please', si: 'කරුණාකර', ta: 'தயவு செய்து', hi: 'कृपया', zh: '请', fr: 'S’il vous plaît' },
//     // Add more words here
// ];

// const languages = [
//     { label: 'English', value: 'en' },
//     { label: 'Sinhala', value: 'si' },
//     { label: 'Tamil', value: 'ta' },
//     { label: 'Hindi', value: 'hi' },
//     { label: 'Chinese', value: 'zh' },
//     { label: 'French', value: 'fr' },
// ];

// const GameScreen = () => {
//     const [score, setScore] = useState(0);
//     const [timer, setTimer] = useState(60);
//     const [nativeLang, setNativeLang] = useState('en');
//     const [targetLang, setTargetLang] = useState('fr');
//     const [selectedAnswers, setSelectedAnswers] = useState({});
//     const [modalVisible, setModalVisible] = useState(false);
//     const [gameStarted, setGameStarted] = useState(false);
//     const [showScore, setShowScore] = useState(false);
//     const [incorrectAnswers, setIncorrectAnswers] = useState([]); // Track incorrect answers
//     const colorScheme = useColorScheme();
//     const isDarkMode = colorScheme === 'dark';

//     useFocusEffect(
//         useCallback(() => {
//             if (gameStarted) {
//                 const interval = setInterval(() => {
//                     setTimer(prev => {
//                         if (prev === 1) {
//                             setModalVisible(true);
//                             clearInterval(interval);
//                             return 0;
//                         } else if (prev > 0) {
//                             return prev - 1;
//                         }
//                         return 0;
//                     });
//                 }, 1000);

//                 return () => clearInterval(interval);
//             }
//         }, [gameStarted])
//     );

//     const handleMatch = (id, selectedValue) => {
//         setSelectedAnswers({ ...selectedAnswers, [id]: selectedValue });
//     };

//     const handleSubmit = () => {
//         if (!gameStarted) {
//             setGameStarted(true);
//             return;
//         }

//         if (Object.keys(selectedAnswers).length < words.length) {
//             ToastAndroid.show("Please enter all answers", ToastAndroid.SHORT);
//             return;
//         }

//         let newScore = 0;
//         let incorrect = [];
//         words.forEach(word => {
//             if (selectedAnswers[word.id] === word[targetLang]) {
//                 newScore += 1;
//             } else {
//                 incorrect.push({ word: word[nativeLang], correct: word[targetLang], entered: selectedAnswers[word.id] });
//             }
//         });
//         setScore(newScore);
//         setIncorrectAnswers(incorrect);
//         setShowScore(true); // Show score modal
//         setModalVisible(true); // Open modal
//     };

//     const handleRestart = () => {
//         setScore(0);
//         setTimer(60);
//         setSelectedAnswers({});
//         setModalVisible(false);
//         setGameStarted(false);
//         setShowScore(false);
//         setIncorrectAnswers([]); // Reset incorrect answers
//     };

//     return (
//         <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
//             <ThemedText style={styles.title}>Word Match Game</ThemedText>
//             <ThemedText style={styles.instructions}>Match the words in your native language with their translations!</ThemedText>

//             <RNPickerSelect
//                 onValueChange={(value) => setNativeLang(value)}
//                 items={languages}
//                 style={pickerSelectStyles}
//                 value={nativeLang}
//                 placeholder={{ label: 'Select Native Language', value: null }}
//             />

//             <RNPickerSelect
//                 onValueChange={(value) => setTargetLang(value)}
//                 items={languages}
//                 style={pickerSelectStyles}
//                 value={targetLang}
//                 placeholder={{ label: 'Select Target Language', value: null }}
//             />

//             <View style={styles.gridContainer}>
//                 <View style={styles.grid}>
//                     <ThemedText style={styles.gridTitle}>Native Language</ThemedText>
//                     {words.map(word => (
//                         <TouchableOpacity key={word.id} style={styles.wordButton} onPress={() => handleMatch(word.id)}>
//                             <Text style={styles.wordText}>{word[nativeLang]}</Text>
//                         </TouchableOpacity>
//                     ))}
//                 </View>
//                 <View style={styles.grid}>
//                     <ThemedText style={styles.gridTitle}>Target Language</ThemedText>
//                     {words.map(word => (
//                         <View key={word.id} style={styles.wordSlot}>
//                             <RNPickerSelect
//                                 onValueChange={(value) => handleMatch(word.id, value)}
//                                 items={languages.map(lang => ({ label: word[lang.value], value: word[lang.value] }))}
//                                 style={pickerSelectStyles}
//                                 value={selectedAnswers[word.id] || ''}
//                                 placeholder={{ label: 'Select Translation', value: null }}
//                             />
//                         </View>
//                     ))}
//                 </View>
//             </View>
//             <View style={styles.footer}>
//                 <ThemedText style={styles.score}>Score: {score}</ThemedText>
//                 <ThemedText style={styles.timer}>Timer: {timer}s</ThemedText>
//             </View>

//             <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
//                 <ThemedText style={styles.submitButtonText}>{gameStarted ? 'Submit' : 'Start Game'}</ThemedText>
//                 {gameStarted && <AntDesign name="checkcircle" size={18} color="white" />}
//             </TouchableOpacity>

//             <Modal
//                 animationType="slide"
//                 transparent={true}
//                 visible={modalVisible}
//                 onRequestClose={() => setModalVisible(!modalVisible)}
//             >
//                 <View style={styles.modalView}>
//                     {showScore ? (
//                         <>
//                             <ThemedText style={styles.modalText}>Your Score: {score}</ThemedText>
//                             {incorrectAnswers.length > 0 && (
//                                 <View style={styles.incorrectContainer}>
//                                     <ThemedText style={styles.modalText}>Incorrect Answers:</ThemedText>
//                                     {incorrectAnswers.map((item, index) => (
//                                         <View key={index} style={styles.incorrectItem}>
//                                             <Text style={styles.incorrectText}>Word: {item.word}</Text>
//                                             <Text style={styles.incorrectText}>Entered: {item.entered}</Text>
//                                             <Text style={styles.incorrectText}>Correct: {item.correct}</Text>
//                                         </View>
//                                     ))}
//                                 </View>
//                             )}
//                             <TouchableOpacity style={styles.tryAgainButton} onPress={handleRestart}>
//                                 <ThemedText style={styles.tryAgainButtonText}>OK</ThemedText>
//                             </TouchableOpacity>
//                         </>
//                     ) : (
//                         <>
//                             <ThemedText style={styles.modalText}>Your time is over</ThemedText>
//                             <TouchableOpacity style={styles.tryAgainButton} onPress={handleRestart}>
//                                 <ThemedText style={styles.tryAgainButtonText}>Try Again</ThemedText>
//                             </TouchableOpacity>
//                         </>
//                     )}
//                 </View>
//             </Modal>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         marginBottom: 10,
//     },
//     instructions: {
//         fontSize: 16,
//         marginBottom: 20,
//         textAlign: 'center',
//     },
//     gridContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         width: '100%',
//         marginBottom: 20,
//     },
//     grid: {
//         width: '45%',
//     },
//     gridTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginBottom: 10,
//         textAlign: 'center',
//     },
//     wordButton: {
//         padding: 25,
//         backgroundColor: '#ddd',
//         marginVertical: 10,
//         borderRadius: 5,
//     },
//     wordSlot: {
//         padding: 10,
//         backgroundColor: '#eee',
//         marginVertical: 5,
//         borderRadius: 5,
//     },
//     wordText: {
//         fontSize: 16,
//         textAlign: 'center',
//     },
//     footer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         width: '100%',
//         marginTop: 20,
//     },
//     score: {
//         fontSize: 18,
//     },
//     timer: {
//         fontSize: 18,
//     },
//     submitButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#47B6E5',
//         padding: 15,
//         borderRadius: 20,
//     },
//     submitButtonText: {
//         color: 'white',
//         marginRight: 5,
//     },
//     modalView: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: 'rgba(0,0,0,0.8)',
//     },
//     modalText: {
//         fontSize: 24,
//         color: 'white',
//         marginBottom: 20,
//         textAlign: 'center',
//     },
//     tryAgainButton: {
//         backgroundColor: '#47B6E5',
//         padding: 15,
//         borderRadius: 20,
//     },
//     tryAgainButtonText: {
//         color: 'white',
//         fontSize: 18,
//     },
//     incorrectContainer: {
//         marginVertical: 20,
//     },
//     incorrectItem: {
//         marginVertical: 10,
//     },
//     incorrectText: {
//         fontSize: 16,
//         color: 'white',
//     },
// });

// const pickerSelectStyles = StyleSheet.create({
//     inputIOS: {
//         backgroundColor: '#e0f7fa',
//         borderRadius: 10,
//         marginBottom: 20,
//         padding: 10,
//     },
//     inputAndroid: {
//         backgroundColor: '#e0f7fa',
//         borderRadius: 10,
//         marginBottom: 10,
//         padding: 10,
//     },
// });

// export default GameScreen;

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Modal, ToastAndroid, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import { ThemedText } from '../components/ThemedText';
import { AntDesign } from '@expo/vector-icons';

const words = [
    { id: '1', en: 'Hello', si: 'හෙලෝ', ta: 'வணக்கம்', hi: 'नमस्ते', zh: '你好', fr: 'Bonjour' },
    { id: '2', en: 'Goodbye', si: 'ගුඩ්බයි', ta: 'பிரியாவிடை', hi: 'अलविदा', zh: '再见', fr: 'Au revoir' },
    { id: '3', en: 'Please', si: 'කරුණාකර', ta: 'தயவு செய்து', hi: 'कृपया', zh: '请', fr: 'S’il vous plaît' },
    // Add more words here
];

const languages = [
    { label: 'English', value: 'en' },
    { label: 'Sinhala', value: 'si' },
    { label: 'Tamil', value: 'ta' },
    { label: 'Hindi', value: 'hi' },
    { label: 'Chinese', value: 'zh' },
    { label: 'French', value: 'fr' },
];

const GameScreen = () => {
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(60);
    const [nativeLang, setNativeLang] = useState('en');
    const [targetLang, setTargetLang] = useState('fr');
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [showScore, setShowScore] = useState(false);
    const [incorrectAnswers, setIncorrectAnswers] = useState([]); // Track incorrect answers
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    useFocusEffect(
        useCallback(() => {
            if (gameStarted) {
                const interval = setInterval(() => {
                    setTimer(prev => {
                        if (prev === 1) {
                            setModalVisible(true);
                            clearInterval(interval);
                            return 0;
                        } else if (prev > 0) {
                            return prev - 1;
                        }
                        return 0;
                    });
                }, 1000);

                return () => clearInterval(interval);
            }
        }, [gameStarted])
    );

    const handleMatch = (id, selectedValue) => {
        setSelectedAnswers({ ...selectedAnswers, [id]: selectedValue });
    };

    const handleSubmit = () => {
        if (!gameStarted) {
            setGameStarted(true);
            return;
        }

        if (Object.keys(selectedAnswers).length < words.length) {
            ToastAndroid.show("Please enter all answers", ToastAndroid.SHORT);
            return;
        }

        let newScore = 0;
        let incorrect = [];
        words.forEach(word => {
            if (selectedAnswers[word.id] === word[targetLang]) {
                newScore += 1;
            } else {
                incorrect.push({ word: word[nativeLang], correct: word[targetLang], entered: selectedAnswers[word.id] });
            }
        });
        setScore(newScore);
        setIncorrectAnswers(incorrect);
        setShowScore(true); // Show score modal
        setModalVisible(true); // Open modal
    };

    const handleRestart = () => {
        setScore(0);
        setTimer(60);
        setSelectedAnswers({});
        setModalVisible(false);
        setGameStarted(false);
        setShowScore(false);
        setIncorrectAnswers([]); // Reset incorrect answers
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
                <ThemedText style={styles.title}>Word Match Game</ThemedText>
                <ThemedText style={styles.instructions}>Match the words in your native language with their translations!</ThemedText>

                <RNPickerSelect
                    onValueChange={(value) => setNativeLang(value)}
                    items={languages}
                    style={pickerSelectStyles}
                    value={nativeLang}
                    placeholder={{ label: 'Select Native Language', value: null }}
                />

                <RNPickerSelect
                    onValueChange={(value) => setTargetLang(value)}
                    items={languages}
                    style={pickerSelectStyles}
                    value={targetLang}
                    placeholder={{ label: 'Select Target Language', value: null }}
                />

                <View style={styles.gridContainer}>
                    <View style={styles.grid}>
                        <ThemedText style={styles.gridTitle}>Native Language</ThemedText>
                        {words.map(word => (
                            <TouchableOpacity key={word.id} style={styles.wordButton} onPress={() => handleMatch(word.id)}>
                                <Text style={styles.wordText}>{word[nativeLang]}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.grid}>
                        <ThemedText style={styles.gridTitle}>Target Language</ThemedText>
                        {words.map(word => (
                            <View key={word.id} style={styles.wordSlot}>
                                <RNPickerSelect
                                    onValueChange={(value) => handleMatch(word.id, value)}
                                    items={languages.map(lang => ({ label: word[lang.value], value: word[lang.value] }))}
                                    style={pickerSelectStyles}
                                    value={selectedAnswers[word.id] || ''}
                                    placeholder={{ label: 'Select Translation', value: null }}
                                />
                            </View>
                        ))}
                    </View>
                </View>
                <View style={styles.footer}>
                    <ThemedText style={styles.score}>Score: {score}</ThemedText>
                    <ThemedText style={styles.timer}>Timer: {timer}s</ThemedText>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <ThemedText style={styles.submitButtonText}>{gameStarted ? 'Submit' : 'Start Game'}</ThemedText>
                    {gameStarted && <AntDesign name="checkcircle" size={18} color="white" />}
                </TouchableOpacity>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(!modalVisible)}
                >
                    <View style={styles.modalView}>
                        {showScore ? (
                            <>
                                <ThemedText style={styles.modalText}>Your Score: {score}</ThemedText>
                                {incorrectAnswers.length > 0 && (
                                    <View style={styles.incorrectContainer}>
                                        <ThemedText style={styles.modalText}>Incorrect Answers:</ThemedText>
                                        {incorrectAnswers.map((item, index) => (
                                            <View key={index} style={styles.incorrectItem}>
                                                <Text style={styles.incorrectText}>Word: {item.word}</Text>
                                                <Text style={styles.incorrectText}>Entered: {item.entered}</Text>
                                                <Text style={styles.incorrectText}>Correct: {item.correct}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                                <TouchableOpacity style={styles.tryAgainButton} onPress={handleRestart}>
                                    <ThemedText style={styles.tryAgainButtonText}>OK</ThemedText>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <ThemedText style={styles.modalText}>Your time is over</ThemedText>
                                <TouchableOpacity style={styles.tryAgainButton} onPress={handleRestart}>
                                    <ThemedText style={styles.tryAgainButtonText}>Try Again</ThemedText>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </Modal>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    instructions: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    gridContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    grid: {
        width: '45%',
    },
    gridTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    wordButton: {
        padding: 25,
        backgroundColor: '#ddd',
        marginVertical: 10,
        borderRadius: 5,
    },
    wordSlot: {
        padding: 10,
        backgroundColor: '#eee',
        marginVertical: 5,
        borderRadius: 5,
    },
    wordText: {
        fontSize: 16,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    score: {
        fontSize: 18,
    },
    timer: {
        fontSize: 18,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#47B6E5',
        padding: 15,
        borderRadius: 20,
    },
    submitButtonText: {
        color: 'white',
        marginRight: 5,
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalText: {
        fontSize: 24,
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',
    },
    tryAgainButton: {
        backgroundColor: '#47B6E5',
        padding: 15,
        borderRadius: 20,
    },
    tryAgainButtonText: {
        color: 'white',
        fontSize: 18,
    },
    incorrectContainer: {
        marginVertical: 20,
    },
    incorrectItem: {
        marginVertical: 10,
    },
    incorrectText: {
        fontSize: 16,
        color: 'white',
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        backgroundColor: '#e0f7fa',
        borderRadius: 10,
        marginBottom: 20,
        padding: 10,
    },
    inputAndroid: {
        backgroundColor: '#e0f7fa',
        borderRadius: 10,
        marginBottom: 10,
        padding: 10,
    },
});

export default GameScreen;
