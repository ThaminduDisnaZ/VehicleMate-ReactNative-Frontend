import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Vehicle data type (can be shared across files)
type Vehicle = {
    localId: string;
    vehicleId?: number;
    name: string;
    licensePlate: string;
    licenseExpiry: string;
    insuranceExpiry: string;
};

// --- Reusable Component for a single vehicle item ---
const VehicleItem = ({ name, licensePlate, onPress }: { name: string, licensePlate: string, onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
        <View style={styles.itemIconContainer}>
            <Ionicons name="car-sport-outline" size={30} color="#8B5CF6" />
        </View>
        <View style={styles.itemTextContainer}>
            <Text style={styles.itemName}>{name}</Text>
            <Text style={styles.itemLicensePlate}>{licensePlate}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
    </TouchableOpacity>
);

// --- Main My Vehicles Screen Component ---
export default function MyVehiclesScreen() {
    const navigation = useNavigation();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    // Load vehicles from AsyncStorage every time the screen is focused
    useFocusEffect(
        useCallback(() => {
            const loadVehicles = async () => {
                try {
                    const vehiclesJSON = await AsyncStorage.getItem('vehicles');
                    setVehicles(vehiclesJSON ? JSON.parse(vehiclesJSON) : []);
                } catch (e) {
                    console.error("Failed to load vehicles from storage", e);
                }
            };
            loadVehicles();
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <Text style={styles.header}>My Vehicles</Text>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('AddVehicle' as never)} 
                    style={styles.addButton}
                >
                    <Ionicons name="add" size={28} color="white" />
                </TouchableOpacity>
            </View>

            {/* List of Vehicles */}
            <FlatList
                data={vehicles}
                renderItem={({ item }) => (
                    <VehicleItem
                        name={item.name}
                        licensePlate={item.licensePlate}
                        onPress={() => {
                            // Navigate to a detail screen for this vehicle
                            // navigation.navigate('VehicleDetail', { vehicleLocalId: item.localId });
                        }}
                    />
                )}
                keyExtractor={(item) => item.localId}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No vehicles added yet.</Text>
                        <Text style={styles.emptySubText}>Tap the '+' button to add your first vehicle.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

// --- StyleSheet for all the styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    headerContainer: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    addButton: {
        backgroundColor: '#2563EB',
        padding: 8,
        borderRadius: 50,
    },
    itemContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    itemIconContainer: {
        backgroundColor: '#EDE9FE',
        padding: 12,
        borderRadius: 50,
    },
    itemTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    itemName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    itemLicensePlate: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    emptyContainer: {
        marginTop: 80,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#6B7280',
        fontWeight: '600',
    },
    emptySubText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
});
