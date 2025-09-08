import { View, Text,  TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';


type Vehicle = {
    localId: string;
    vehicleId?: number;
    name: string;
    licensePlate: string;
    licenseExpiry: string;
    insuranceExpiry: string;
};


export default function AddVehicleScreen() {
    const navigation = useNavigation();
    
    
    const [name, setName] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [licenseExpiry, setLicenseExpiry] = useState(new Date());
    const [insuranceExpiry, setInsuranceExpiry] = useState(new Date());

    
    const [pickerVisible, setPickerVisible] = useState<{ type: 'license' | 'insurance' | null, show: boolean }>({ type: null, show: false });

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || (pickerVisible.type === 'license' ? licenseExpiry : insuranceExpiry);
        setPickerVisible({ type: null, show: false }); 

        if (event.type === "set" && selectedDate) {
            if (pickerVisible.type === 'license') {
                setLicenseExpiry(currentDate);
            } else if (pickerVisible.type === 'insurance') {
                setInsuranceExpiry(currentDate);
            }
        }
    };
    
    
    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const handleSaveVehicle = async () => {
        
        if (!name.trim() || !licensePlate.trim()) {
            Alert.alert('Missing Information', 'Please fill in the vehicle name and license plate.');
            return;
        }

        const newVehicle: Vehicle = {
            localId: Date.now().toString(), 
            name: name.trim(),
            licensePlate: licensePlate.trim().toUpperCase(),
            licenseExpiry: formatDate(licenseExpiry),
            insuranceExpiry: formatDate(insuranceExpiry),
        };

        try {
            const existingVehiclesJSON = await AsyncStorage.getItem('vehicles');
            const existingVehicles = existingVehiclesJSON ? JSON.parse(existingVehiclesJSON) : [];
            
            const updatedVehicles = [...existingVehicles, newVehicle];
            await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));

            Alert.alert('Success', 'Vehicle added successfully!');
            navigation.goBack();

        } catch (e) {
            console.error("Failed to save vehicle", e);
            Alert.alert('Error', 'Could not save the vehicle.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.header}>Add New Vehicle</Text>
            </View>
            
            <View style={styles.formContainer}>
                <Text style={styles.label}>Vehicle Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., My Bajaj Pulsar"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>License Plate</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., WP ABC-1234"
                    value={licensePlate}
                    onChangeText={setLicensePlate}
                    autoCapitalize="characters"
                />

                <Text style={styles.label}>License Expiry Date</Text>
                <TouchableOpacity onPress={() => setPickerVisible({ type: 'license', show: true })} style={styles.datePickerButton}>
                    <Text style={styles.datePickerText}>{formatDate(licenseExpiry)}</Text>
                    <Ionicons name="calendar-outline" size={24} color="gray" />
                </TouchableOpacity>

                <Text style={styles.label}>Insurance Expiry Date</Text>
                <TouchableOpacity onPress={() => setPickerVisible({ type: 'insurance', show: true })} style={styles.datePickerButton}>
                    <Text style={styles.datePickerText}>{formatDate(insuranceExpiry)}</Text>
                    <Ionicons name="calendar-outline" size={24} color="gray" />
                </TouchableOpacity>
            </View>

 
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveVehicle}>
                <Text style={styles.saveButtonText}>Save Vehicle</Text>
            </TouchableOpacity>


            {pickerVisible.show && (
                <DateTimePicker
                    value={pickerVisible.type === 'license' ? licenseExpiry : insuranceExpiry}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    headerContainer: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 16,
    },
    formContainer: {
        padding: 16,
    },
    label: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    datePickerButton: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    datePickerText: {
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#2563EB',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        margin: 16,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
