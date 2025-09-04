import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './src/MainTabNavigator'; 
import AddVehicleScreen from './src/AddVehicleScreen';
import AddFuelLogScreen from './src/AddFuelLogScreen';
import AddOtherExpenseScreen from './src/AddOtherExpenseScreen';
import VehicleDetailScreen from './src/VehicleDetailScreen';
import LoginScreen from './src/LoginScreen'; // Ensure LoginScreen is imported
import { AuthProvider } from './src/AuthContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {/* Group for main screens with tabs */}
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabNavigator} 
            options={{ headerShown: false }} 
          />
          {/* Group for regular screens that slide from the side */}
          <Stack.Screen 
            name="VehicleDetail" 
            component={VehicleDetailScreen}
            options={{ headerShown: false }} 
          />
          
          {/* Group for screens that appear on top as modals */}
          <Stack.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="AddVehicle" component={AddVehicleScreen}/>
            <Stack.Screen name="AddFuelLog" component={AddFuelLogScreen} />
            <Stack.Screen name="AddOtherExpense" component={AddOtherExpenseScreen} />
          </Stack.Group>

        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

