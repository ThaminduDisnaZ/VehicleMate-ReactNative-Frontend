import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Data types
type Vehicle = { localId: string; name: string; licensePlate: string; licenseExpiry: string; insuranceExpiry: string; };
type FuelLog = { localId: string; date: string; cost: number; vehicleLocalId: string; odometer: number; liters: number; };
type OtherExpense = { localId: string; date: string; description: string; cost: number; vehicleLocalId: string; };

// --- Reusable Component for list items ---
const LogItem = ({ title, subtitle, amount }: { title: string, subtitle: string, amount: number }) => (
    <View style={styles.logItem}>
        <View>
            <Text style={styles.logTitle}>{title}</Text>
            <Text style={styles.logSubtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.logAmount}>LKR {amount.toFixed(2)}</Text>
    </View>
);


// --- Main Vehicle Detail Screen Component ---
export default function VehicleDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { vehicleLocalId } = route.params as { vehicleLocalId: string };

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
    const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>([]);

    // Load all data related to this vehicle when the screen is focused
    useFocusEffect(
        useCallback(() => {
            const loadVehicleData = async () => {
                try {
                    // Find the specific vehicle
                    const vehiclesJSON = await AsyncStorage.getItem('vehicles');
                    const allVehicles: Vehicle[] = vehiclesJSON ? JSON.parse(vehiclesJSON) : [];
                    const currentVehicle = allVehicles.find(v => v.localId === vehicleLocalId);
                    setVehicle(currentVehicle || null);

                    // Filter fuel logs for this vehicle
                    const fuelLogsJSON = await AsyncStorage.getItem('fuel_logs');
                    const allFuelLogs: FuelLog[] = fuelLogsJSON ? JSON.parse(fuelLogsJSON) : [];
                    setFuelLogs(allFuelLogs.filter(log => log.vehicleLocalId === vehicleLocalId));

                    // Filter other expenses for this vehicle
                    const otherExpensesJSON = await AsyncStorage.getItem('other_expenses');
                    const allOtherExpenses: OtherExpense[] = otherExpensesJSON ? JSON.parse(otherExpensesJSON) : [];
                    setOtherExpenses(allOtherExpenses.filter(exp => exp.vehicleLocalId === vehicleLocalId));

                } catch (e) {
                    console.error("Failed to load vehicle data", e);
                }
            };
            loadVehicleData();
        }, [vehicleLocalId])
    );

    if (!vehicle) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Loading vehicle details...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#1F2937" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.header}>{vehicle.name}</Text>
                    <Text style={styles.subHeader}>{vehicle.licensePlate}</Text>
                </View>
            </View>

            <ScrollView>
                {/* Action buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        // onPress={() => navigation.navigate('AddFuelLog', { vehicleLocalId })} 
                        style={[styles.actionButton, styles.fuelButton]}
                    >
                        <Ionicons name="water" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Add Fuel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        // onPress={() => navigation.navigate('AddOtherExpense', { vehicleLocalId })}
                        style={[styles.actionButton, styles.expenseButton]}
                    >
                        <Ionicons name="build" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Add Expense</Text>
                    </TouchableOpacity>
                </View>

                {/* Fuel Logs Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Fuel Logs</Text>
                    {fuelLogs.length > 0 ? (
                        fuelLogs.map(log => (
                            <LogItem key={log.localId} title={`Filled on ${log.date}`} subtitle={`${log.odometer} km`} amount={log.cost} />))
                    ) : <Text style={styles.noItemsText}>No fuel logs recorded.</Text>}
                </View>

                {/* Other Expenses Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Other Expenses</Text>
                    {otherExpenses.length > 0 ? (
                        otherExpenses.map(exp => (
                            <LogItem key={exp.localId} title={exp.description} subtitle={exp.date} amount={exp.cost} />
                        ))
                    ) : <Text style={styles.noItemsText}>No other expenses recorded.</Text>}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    loadingText: { textAlign: 'center', marginTop: 50, fontSize: 18 },
    headerContainer: { padding: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    header: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginLeft: 16 },
    subHeader: { fontSize: 14, color: '#6B7280', marginLeft: 16 },
    actionsContainer: { padding: 16, flexDirection: 'row', justifyContent: 'space-around' },
    actionButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    fuelButton: { backgroundColor: '#22C55E', marginRight: 8 },
    expenseButton: { backgroundColor: '#3B82F6', marginLeft: 8 },
    actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
    section: { marginHorizontal: 16, marginTop: 16 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
    logItem: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    logTitle: { fontSize: 16, fontWeight: '600' },
    logSubtitle: { fontSize: 14, color: 'gray', marginTop: 4 },
    logAmount: { fontSize: 16, fontWeight: 'bold', color: '#EF4444' },
    noItemsText: { color: '#6B7280', textAlign: 'center', paddingVertical: 20 },
});
