import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './src/MainTabNavigator'; 
import AddVehicleScreen from './src/AddVehicleScreen';
import AddFuelLogScreen from './src/AddFuelLogScreen';
import AddOtherExpenseScreen from './src/AddOtherExpenseScreen';
import VehicleDetailScreen from './src/VehicleDetailScreen';
import LoginScreen from './src/LoginScreen'; 
import { AuthProvider } from './src/AuthContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>

          <Stack.Screen 
            name="MainTabs" 
            component={MainTabNavigator} 
            options={{ headerShown: false }} 
          />

          <Stack.Screen 
            name="VehicleDetail" 
            component={VehicleDetailScreen}
            options={{ headerShown: false }} 
          />

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

