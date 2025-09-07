import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthContext';

// --- Reusable Button Component ---
const SettingsButton = ({ label, iconName, onPress, isLoading = false }: { label: string; iconName: keyof typeof Ionicons.glyphMap; onPress: () => void; isLoading?: boolean; }) => (
    <TouchableOpacity onPress={onPress} disabled={isLoading} style={styles.button}>
        <Ionicons name={iconName} size={24} color="#4B5563" />
        <Text style={styles.buttonLabel}>{label}</Text>
        <View style={styles.buttonIcon}>
            {isLoading ? <ActivityIndicator color="#4B5563" /> : <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />}
        </View>
    </TouchableOpacity>
);

// --- Main Settings Screen ---
export default function SettingsScreen() {
    const navigation = useNavigation();
    const { user, logout } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);

    const handleLoginLogout = () => {
        if (user) {
            Alert.alert('Logout', 'Are you sure you want to log out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: logout, style: 'destructive' },
            ]);
        } else {
            // Use getParent() to navigate to the Login screen in the parent StackNavigator
            navigation.getParent()?.navigate('Login' as never);
        }
    };

    const handleSync = async () => {
        if (!user) {
            Alert.alert('Login Required', 'You must log in to sync your data.', [
                { text: 'Login', onPress: () => navigation.getParent()?.navigate('Login' as never) },
                { text: 'Cancel' }
            ]);
            return;
        }

        setIsSyncing(true);
        try {
            // 1. Get all local data from AsyncStorage
            const vehiclesJSON = await AsyncStorage.getItem('vehicles');
            const fuelLogsJSON = await AsyncStorage.getItem('fuel_logs');
            const otherExpensesJSON = await AsyncStorage.getItem('other_expenses');

            const localData = {
                vehicles: vehiclesJSON ? JSON.parse(vehiclesJSON) : [],
                fuelLogs: fuelLogsJSON ? JSON.parse(fuelLogsJSON) : [],
                otherExpenses: otherExpensesJSON ? JSON.parse(otherExpensesJSON) : [],
            };

            // 2. Send all local data to the server for syncing
            // IMPORTANT: Replace with your actual IP Address and project name
            const API_URL = 'http://192.168.8.102:8080/VehicleMate-Backend/syncVehicleData';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.userId,
                    ...localData
                }),
            });

            if (!response.ok) {
                throw new Error('Sync failed on the server. Please check the server logs.');
            }

            // 3. Receive the complete, synced data from the server
            const syncedData = await response.json();

            // 4. Replace local data with the complete data from the server
            await AsyncStorage.setItem('vehicles', JSON.stringify(syncedData.vehicles || []));
            await AsyncStorage.setItem('fuel_logs', JSON.stringify(syncedData.fuelLogs || []));
            await AsyncStorage.setItem('other_expenses', JSON.stringify(syncedData.otherExpenses || []));

            Alert.alert('Sync Complete', 'Your vehicle data is now up-to-date.');

        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Could not sync data. Please check your network connection:' + e);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Settings</Text>
            </View>
            <View style={styles.content}>
                <SettingsButton
                    label={user ? user.username : 'Login'}
                    iconName="person-circle-outline"
                    onPress={handleLoginLogout}
                />
                
                <SettingsButton
                    label="Sync with Cloud"
                    iconName="cloud-circle-outline"
                    onPress={handleSync}
                    isLoading={isSyncing}
                />
                <SettingsButton
                    label={'Clear Local Data'}
                    iconName="person-circle-outline"
                    onPress={async () => {
                        Alert.alert('Clear Local Data', 'Are you sure you want to clear all local data? This action cannot be undone.', [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Clear', onPress: async () => {
                                    try {
                                        await AsyncStorage.removeItem('vehicles');
                                        await AsyncStorage.removeItem('fuel_logs');
                                        await AsyncStorage.removeItem('other_expenses');
                                        Alert.alert('Success', 'All local data has been cleared.');
                                    } catch (e) {
                                        console.error(e);
                                        Alert.alert('Error', 'Could not clear local data. Please try again.');
                                    }
                                }, style: 'destructive'
                            },
                        ]);
                    }
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    headerContainer: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    header: { fontSize: 30, fontWeight: 'bold', color: '#1F2937' },
    content: { padding: 16 },
    button: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    buttonLabel: {
        fontSize: 18,
        color: '#1F2937',
        marginLeft: 16,
        fontWeight: '600',
    },
    buttonIcon: {
        marginLeft: 'auto',
    },
});