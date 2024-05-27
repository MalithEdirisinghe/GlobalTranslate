import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const TranslateScreen = () => {
    const [inputLanguage, setInputLanguage] = useState('en');
    const [outputLanguage, setOutputLanguage] = useState('es');
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const handleTranslate = () => {
        // Implement translation logic here
        setTranslatedText('Translated words go here...');
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
                    <Picker.Item label="Select Language" value="" />
                    <Picker.Item label="English" value="en" />
                    <Picker.Item label="Spanish" value="es" />
                    {/* Add more languages as needed */}
                </Picker>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Enter your words..."
                value={inputText}
                onChangeText={setInputText}
            />

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={outputLanguage}
                    style={styles.picker}
                    onValueChange={(itemValue) => setOutputLanguage(itemValue)}
                >
                    <Picker.Item label="Select Language" value="" />
                    <Picker.Item label="English" value="en" />
                    <Picker.Item label="Spanish" value="es" />
                    {/* Add more languages as needed */}
                </Picker>
            </View>

            <TextInput
                style={styles.output}
                placeholder="Translated words"
                value={translatedText}
                editable={false}
            />

            <TouchableOpacity style={styles.button} onPress={handleTranslate}>
                <Text style={styles.buttonText}>Translate</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#0073e6',
    },
    pickerContainer: {
        backgroundColor: '#96DEFD',
        borderRadius: 10,
        marginBottom: 20,
    },
    picker: {
        height: 50,
        width: '100%',
    },
    input: {
        height: 150,
        borderColor: '#e0f7fa',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        backgroundColor: '#e0f7fa',
        marginBottom: 20,
        textAlignVertical: 'top',
    },
    output: {
        height: 150,
        borderColor: '#f8bbd0',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        backgroundColor: '#f8bbd0',
        marginBottom: 20,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#47B6E5',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default TranslateScreen;
