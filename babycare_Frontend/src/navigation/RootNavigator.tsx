import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import BabySelectScreen from '../screens/monitor/BabySelectScreen';
import MonitorScreen from '../screens/monitor/MonitorScreen';
import ViewerScreen from '../screens/monitor/ViewerScreen';
import { useAuthStore } from '../store/authStore';
import { RootAppStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootAppStackParamList>();

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainNavigator} />
            <Stack.Screen name="BabySelect" component={BabySelectScreen} />
            <Stack.Screen name="Monitor" component={MonitorScreen} />
            <Stack.Screen name="Viewer" component={ViewerScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}