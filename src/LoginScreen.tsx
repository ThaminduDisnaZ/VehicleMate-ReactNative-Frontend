import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthContext';

// --- Main Login Screen Component ---
export default function LoginScreen() {
    const navigation = useNavigation();
    const { login } = useAuth(); // Get the login function from our AuthContext
    
    // Form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLoginOrRegister = async () => {
        // Validation
        if (!username.trim() || !password.trim()) {
            Alert.alert('Missing Information', 'Please enter a username and password.');
            return;
        }

        setIsLoading(true);
        try {
            // IMPORTANT: Replace with your actual IP and endpoint
            const API_URL = 'http://192.168.8.102:8080/VehicleMate-Backend//login'; 

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const userData = await response.json();
                // Call the global login function from AuthContext
                login(userData); 
                Alert.alert('Success', `Welcome, ${userData.username}!`);
                navigation.goBack(); // Close the modal login screen
            } else {
                // Handle specific errors like "Wrong password" from the server
                const errorData = await response.json();
                Alert.alert('Login Failed', errorData.error || 'Invalid username or password.');
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Could not connect to the server. Please check your network.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.modalView}>
                {/* Close Button */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close-circle" size={32} color="#9CA3AF" />
                </TouchableOpacity>

                <Text style={styles.header}>Login or Register</Text>
                <Text style={styles.subHeader}>Enter your details to sync your data with the cloud.</Text>

                <Text style={styles.label}>Username</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter a username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter a password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry // Hides the password
                />

                {/* Login Button */}
                <TouchableOpacity 
                    style={styles.loginButton} 
                    onPress={handleLoginOrRegister} 
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.loginButtonText}>Continue</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// --- StyleSheet for all the styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Dimmed background
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1F2937',
    },
    subHeader: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        color: '#4B5563',
        fontWeight: '600',
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        width: '100%',
    },
    loginButton: {
        backgroundColor: '#2563EB',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
