import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// --- Type Definitions ---

// This type definition helps TypeScript understand your navigation structure
export type RootStackParamList = {
    MainTabs: undefined;
    VehicleDetail: { vehicleLocalId: string };
    AddVehicle: undefined;
    AddFuelLog: { vehicleLocalId: string };
    AddOtherExpense: { vehicleLocalId: string };
    Login: undefined;
};

// Define the data types for the app
type Vehicle = {
    localId: string;
    vehicleId?: number;
    name: string;
    licensePlate: string;
    licenseExpiry: string; // Stored as "yyyy-MM-dd"
    insuranceExpiry: string; // Stored as "yyyy-MM-dd"
};

type FuelLog = {
    localId: string;
    logId?: number;
    date: string; // Stored as "yyyy-MM-dd"
    cost: number;
    vehicleLocalId: string;
};

// --- Main Dashboard Screen Component ---
export default function DashboardScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);

    // Load all necessary data from AsyncStorage whenever the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                try {
                    const vehiclesJSON = await AsyncStorage.getItem('vehicles');
                    setVehicles(vehiclesJSON ? JSON.parse(vehiclesJSON) : []);

                    const fuelLogsJSON = await AsyncStorage.getItem('fuel_logs');
                    setFuelLogs(fuelLogsJSON ? JSON.parse(fuelLogsJSON) : []);
                } catch (e) {
                    console.error("Failed to load data from storage", e);
                }
            };
            loadData();
        }, [])
    );

    // useMemo ensures these calculations only run when vehicles or fuelLogs change
    const { upcomingReminders, totalFuelCostThisMonth } = useMemo(() => {
        const reminders: { message: string, daysLeft: number }[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to the start of the day for accurate comparison

        vehicles.forEach(v => {
            // Check license expiry date
            const licenseDate = new Date(v.licenseExpiry);
            const licenseDiff = Math.ceil((licenseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (licenseDiff <= 30 && licenseDiff >= 0) {
                reminders.push({ message: `${v.name} - License expires`, daysLeft: licenseDiff });
            }

            // Check insurance expiry date
            const insuranceDate = new Date(v.insuranceExpiry);
            const insuranceDiff = Math.ceil((insuranceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (insuranceDiff <= 30 && insuranceDiff >= 0) {
                reminders.push({ message: `${v.name} - Insurance expires`, daysLeft: insuranceDiff });
            }
        });
        
        // Sort reminders to show the most urgent ones first
        reminders.sort((a, b) => a.daysLeft - b.daysLeft);

        // Calculate total fuel cost for the current calendar month
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const totalFuel = fuelLogs
            .filter(log => {
                const logDate = new Date(log.date);
                return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
            })
            .reduce((total, log) => total + log.cost, 0);

        return { upcomingReminders: reminders, totalFuelCostThisMonth: totalFuel };
    }, [vehicles, fuelLogs]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.header}>Dashboard</Text>

                {/* Reminders Section */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Upcoming Reminders</Text>
                    {upcomingReminders.length > 0 ? (
                        upcomingReminders.map((item, index) => (
                            <View key={index} style={styles.reminderItem}>
                                <Ionicons name="warning" size={24} color="#D97706" />
                                <View style={styles.reminderTextContainer}>
                                    <Text style={styles.reminderMessage}>{item.message}</Text>
                                    <Text style={styles.reminderDaysLeft}>{item.daysLeft === 0 ? "Expires Today!" : `in ${item.daysLeft} days`}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noItemsText}>No upcoming reminders in the next 30 days.</Text>
                    )}
                </View>

                {/* Fuel Summary Section */}
                <View style={styles.card}>
                     <Text style={styles.cardTitle}>Fuel Summary</Text>
                     <Text style={styles.summaryLabel}>Total spent this month</Text>
                     <Text style={styles.summaryAmount}>
                        LKR {totalFuelCostThisMonth.toFixed(2)}
                     </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                     <TouchableOpacity 
                        onPress={() => navigation.navigate('AddFuelLog', { vehicleLocalId: '' })} // Navigates to the fuel log screen
                        style={[styles.actionButton, styles.fuelButton]}
                     >
                        <Ionicons name="water" size={24} color="white" />
                        <Text style={styles.actionButtonText}>Log Fuel</Text>
                     </TouchableOpacity>
                     <TouchableOpacity 
                        onPress={() => navigation.navigate('MainTabs', { screen: 'My Vehicles' }as never)} // Navigates to the My Vehicles tab
                        style={[styles.actionButton, styles.vehiclesButton]}
                    >
                        <Ionicons name="car-sport" size={24} color="white" />
                        <Text style={styles.actionButtonText}>My Vehicles</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

// --- StyleSheet for all the styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        padding: 16,
    },
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 24,
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    reminderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    reminderTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    reminderMessage: {
        fontWeight: '600',
        color: '#1F2937',
    },
    reminderDaysLeft: {
        color: '#D97706',
        fontWeight: 'bold',
    },
    noItemsText: {
        color: '#6B7280',
        fontStyle: 'italic',
    },
    summaryLabel: {
        fontSize: 16,
        color: '#6B7280',
    },
    summaryAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2563EB',
        marginTop: 4,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    fuelButton: {
        backgroundColor: '#10B981',
        marginRight: 8,
    },
    vehiclesButton: {
        backgroundColor: '#8B5CF6',
        marginLeft: 8,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
});

