import React, { useState, useCallback } from 'react';
import { View, Text,  FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';




export type RootStackParamList = {
    MainTabs: undefined; 
    VehicleDetail: { vehicleLocalId: string }; 
    AddVehicle: undefined;
    AddFuelLog: { vehicleLocalId: string };
    AddOtherExpense: { vehicleLocalId: string };
    Login: undefined;
};


type Vehicle = {
    localId: string;
    vehicleId?: number;
    name: string;
    licensePlate: string;
    licenseExpiry: string;
    insuranceExpiry: string;
};


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


export default function MyVehiclesScreen() {
    
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

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
 
            <View style={styles.headerContainer}>
                <Text style={styles.header}>My Vehicles</Text>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('AddVehicle')} 
                    style={styles.addButton}
                >
                    <Ionicons name="add" size={28} color="white" />
                </TouchableOpacity>
            </View>

     
            <FlatList
                data={vehicles}
                renderItem={({ item }) => (
                    <VehicleItem
                        name={item.name}
                        licensePlate={item.licensePlate}
                        onPress={() => {
                            
                            navigation.navigate('VehicleDetail', { vehicleLocalId: item.localId });
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
        backgroundColor: 'white',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        paddingHorizontal: 20,
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
        textAlign: 'center',
    },
});

