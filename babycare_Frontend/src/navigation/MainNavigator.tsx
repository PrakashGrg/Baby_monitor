import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types/navigation';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import BabiesNavigator from './BabiesNavigator';
import EventsScreen from '../screens/events/EventsScreen';
import SettingsNavigator from './SettingsNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'home',
  Babies: 'happy',
  Events: 'list',
  Settings: 'settings',
};

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 68,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color }) => (
          <Ionicons name={ICONS[route.name as keyof MainTabParamList]} size={26} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Babies" component={BabiesNavigator} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Settings" component={SettingsNavigator} />
    </Tab.Navigator>
  );
}