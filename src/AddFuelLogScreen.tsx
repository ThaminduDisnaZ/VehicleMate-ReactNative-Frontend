import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Fuel Log data type
type FuelLog = {
    localId: string;
    logId?: number;
    date: string;
    odometer: number;
    liters: number;
    cost: number;
    vehicleLocalId: string; // To link it to a vehicle
};

// --- Main Add Fuel Log Screen Component ---
export default function AddFuelLogScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    // Get the vehicle's ID passed from the previous screen (VehicleDetailScreen)
    const { vehicleLocalId } = route.params as { vehicleLocalId: string }; 

    // Form state
    const [odometer, setOdometer] = useState('');
    const [liters, setLiters] = useState('');
    const [cost, setCost] = useState('');
    const [date, setDate] = useState(new Date());

    // Date picker state
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setIsPickerVisible(Platform.OS === 'ios');
        if (event.type === 'set' && selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleSaveLog = async () => {
        // Validation
        const odoValue = parseFloat(odometer);
        const litersValue = parseFloat(liters);
        const costValue = parseFloat(cost);

        if (isNaN(odoValue) || isNaN(litersValue) || isNaN(costValue) || odoValue <= 0 || litersValue <= 0 || costValue <= 0) {
            Alert.alert('Invalid Input', 'Please enter valid numbers for all fields.');
            return;
        }
        
        const newFuelLog: FuelLog = {
            localId: Date.now().toString(),
            odometer: odoValue,
            liters: litersValue,
            cost: costValue,
            date: date.toISOString().split('T')[0],
            vehicleLocalId: vehicleLocalId, // Use the actual vehicle ID
        };

        try {
            const existingLogsJSON = await AsyncStorage.getItem('fuel_logs');
            const existingLogs = existingLogsJSON ? JSON.parse(existingLogsJSON) : [];
            
            const updatedLogs = [...existingLogs, newFuelLog];
            await AsyncStorage.setItem('fuel_logs', JSON.stringify(updatedLogs));

            Alert.alert('Success', 'Fuel log saved successfully!');
            navigation.goBack();

        } catch (e) {
            console.error("Failed to save fuel log", e);
            Alert.alert('Error', 'Could not save the fuel log.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.header}>Log Fuel</Text>
            </View>
            
            <ScrollView contentContainerStyle={styles.formContainer}>
                <Text style={styles.label}>Odometer Reading (km)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., 45678"
                    value={odometer}
                    onChangeText={setOdometer}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Litres Filled</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., 10.5"
                    value={liters}
                    onChangeText={setLiters}
                    keyboardType="decimal-pad"
                />
                
                <Text style={styles.label}>Total Cost (LKR)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., 4500.00"
                    value={cost}
                    onChangeText={setCost}
                    keyboardType="decimal-pad"
                />

                <Text style={styles.label}>Date</Text>
                <TouchableOpacity onPress={() => setIsPickerVisible(true)} style={styles.datePickerButton}>
                    <Text style={styles.datePickerText}>{date.toISOString().split('T')[0]}</Text>
                    <Ionicons name="calendar-outline" size={24} color="gray" />
                </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveLog}>
                <Text style={styles.saveButtonText}>Save Log</Text>
            </TouchableOpacity>

            {isPickerVisible && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // ... styles remain the same
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    headerContainer: { padding: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white' },
    header: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginLeft: 16 },
    formContainer: { padding: 16 },
    label: { fontSize: 16, color: '#4B5563', marginBottom: 8, fontWeight: '600' },
    input: { backgroundColor: 'white', padding: 16, borderRadius: 8, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
    datePickerButton: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    datePickerText: { fontSize: 16 },
    saveButton: { backgroundColor: '#10B981', padding: 16, borderRadius: 8, alignItems: 'center', margin: 16 },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

