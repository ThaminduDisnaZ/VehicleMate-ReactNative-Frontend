import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Define the data types for our app
type Vehicle = {
    localId: string;
    vehicleId?: number;
    name: string;
    licensePlate: string;
    licenseExpiry: string;
    insuranceExpiry: string;
};

type FuelLog = {
    localId: string;
    logId?: number;
    date: string;
    cost: number;
    vehicleLocalId: string;
};

// --- Main Dashboard Screen Component ---
export default function DashboardScreen() {
    const navigation = useNavigation();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);

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

    const { upcomingReminders, totalFuelCostThisMonth } = useMemo(() => {
        const reminders: { message: string, daysLeft: number }[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        vehicles.forEach(v => {
            const licenseDate = new Date(v.licenseExpiry);
            const licenseDiff = Math.ceil((licenseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (licenseDiff <= 30 && licenseDiff >= 0) {
                reminders.push({ message: `${v.name} - License expires`, daysLeft: licenseDiff });
            }

            const insuranceDate = new Date(v.insuranceExpiry);
            const insuranceDiff = Math.ceil((insuranceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (insuranceDiff <= 30 && insuranceDiff >= 0) {
                reminders.push({ message: `${v.name} - Insurance expires`, daysLeft: insuranceDiff });
            }
        });
        
        reminders.sort((a, b) => a.daysLeft - b.daysLeft);

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
                                    <Text style={styles.reminderDaysLeft}>{item.daysLeft === 0 ? "Today!" : `in ${item.daysLeft} days`}</Text>
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
                        // onPress={() => navigation.navigate('AddFuelLog')} 
                        style={[styles.actionButton, styles.fuelButton]}
                     >
                        <Ionicons name="water" size={24} color="white" />
                        <Text style={styles.actionButtonText}>Log Fuel</Text>
                     </TouchableOpacity>
                     <TouchableOpacity 
                        // onPress={() => navigation.navigate('MyVehicles')}
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
        backgroundColor: '#F3F4F6', // bg-gray-100
    },
    scrollContent: {
        padding: 16,
    },
    header: {
        fontSize: 30, // text-3xl
        fontWeight: 'bold',
        color: '#1F2937', // text-gray-800
        marginBottom: 24, // mb-6
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24, // mb-6
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 20, // text-xl
        fontWeight: 'bold',
        marginBottom: 12, // mb-3
    },
    reminderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEDD5', // bg-orange-100
        padding: 12, // p-3
        borderRadius: 8,
        marginBottom: 8, // mb-2
    },
    reminderTextContainer: {
        marginLeft: 12, // ml-3
        flex: 1,
    },
    reminderMessage: {
        fontWeight: '600', // font-semibold
        color: '#1F2937', // text-gray-800
    },
    reminderDaysLeft: {
        color: '#D97706', // text-orange-600
        fontWeight: 'bold',
    },
    noItemsText: {
        color: '#6B7280', // text-gray-500
    },
    summaryLabel: {
        color: '#6B7280', // text-gray-500
    },
    summaryAmount: {
        fontSize: 30, // text-3xl
        fontWeight: 'bold',
        color: '#2563EB', // text-blue-600
        marginTop: 4, // mt-1
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
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
        backgroundColor: '#22C55E', // bg-green-500
        marginRight: 8, // for space-x-4
    },
    vehiclesButton: {
        backgroundColor: '#8B5CF6', // bg-purple-500
        marginLeft: 8, // for space-x-4
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18, // text-lg
        marginLeft: 8, // ml-2
    },
});

