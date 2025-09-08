import React, { useState } from 'react';
import { View, Text,  TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';


type OtherExpense = {
    localId: string;
    expenseId?: number;
    date: string;
    description: string;
    category: string;
    cost: number;
    vehicleLocalId: string; 
};


export default function AddOtherExpenseScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    
    const { vehicleLocalId } = route.params as { vehicleLocalId: string }; 

    
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [cost, setCost] = useState('');
    const [date, setDate] = useState(new Date());

    
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setIsPickerVisible(Platform.OS === 'ios');
        if (event.type === 'set' && selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleSaveExpense = async () => {
        
        const costValue = parseFloat(cost);

        if (!description.trim()) {
            Alert.alert('Invalid Input', 'Please enter a description for the expense.');
            return;
        }
        if (isNaN(costValue) || costValue <= 0) {
            Alert.alert('Invalid Input', 'Please enter a valid cost.');
            return;
        }

        const newExpense: OtherExpense = {
            localId: Date.now().toString(),
            description: description.trim(),
            category: category.trim() || 'General', 
            cost: costValue,
            date: date.toISOString().split('T')[0],
            vehicleLocalId: vehicleLocalId, 
        };

        try {
            const existingExpensesJSON = await AsyncStorage.getItem('other_expenses');
            const existingExpenses = existingExpensesJSON ? JSON.parse(existingExpensesJSON) : [];
            
            const updatedExpenses = [...existingExpenses, newExpense];
            await AsyncStorage.setItem('other_expenses', JSON.stringify(updatedExpenses));

            Alert.alert('Success', 'Expense saved successfully!');
            navigation.goBack();

        } catch (e) {
            console.error("Failed to save other expense", e);
            Alert.alert('Error', 'Could not save the expense.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.header}>Log Other Expense</Text>
            </View>
            
            <ScrollView contentContainerStyle={styles.formContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Full Service, New Tyre"
                    value={description}
                    onChangeText={setDescription}
                />

                <Text style={styles.label}>Category (Optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Maintenance, Repair, Cleaning"
                    value={category}
                    onChangeText={setCategory}
                />
                
                <Text style={styles.label}>Total Cost (LKR)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., 5000.00"
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

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveExpense}>
                <Text style={styles.saveButtonText}>Save Expense</Text>
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
        backgroundColor: '#3B82F6', 
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        margin: 16,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

