import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types/navigation';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { deleteAccount } from '../../api/auth';

type NavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'SettingsMain'>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              await logout();
            } catch (err) {
              Alert.alert('Error', 'Could not delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-slate-900 mb-6">Settings</Text>

        {/* Account section */}
        <Text className="text-sm font-semibold text-slate-400 uppercase mb-2 mt-2">Account</Text>
        <Card className="mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-14 h-14 bg-primary-100 rounded-full items-center justify-center mr-4">
              <Text className="text-2xl">👤</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-slate-900 text-base">
                {user?.username || 'User'}
              </Text>
              <Text className="text-slate-400 text-sm">{user?.email || ''}</Text>
            </View>
          </View>
          <View className="h-px bg-slate-100 mb-3" />
          <TouchableOpacity className="py-2" onPress={() => navigation.navigate('EditProfile')}>
            <Text className="text-primary-600 font-medium">Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-2" onPress={() => navigation.navigate('ChangePassword')}>
            <Text className="text-primary-600 font-medium">Change Password</Text>
          </TouchableOpacity>
        </Card>

        {/* Preferences section */}
        <Text className="text-sm font-semibold text-slate-400 uppercase mb-2">Preferences</Text>
        <Card className="mb-6">
          <View className="flex-row items-center justify-between py-2">
            <View>
              <Text className="text-slate-900 font-medium">Push Notifications</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Motion & cry alerts</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
              thumbColor={notifications ? '#2563eb' : '#f4f4f5'}
            />
          </View>
          <View className="h-px bg-slate-100 my-2" />
          <View className="flex-row items-center justify-between py-2">
            <View>
              <Text className="text-slate-900 font-medium">Dark Mode</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Coming soon</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              disabled
              trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
            />
          </View>
        </Card>

        {/* About section */}
        <Text className="text-sm font-semibold text-slate-400 uppercase mb-2">About</Text>
        <Card className="mb-6">
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-slate-900 font-medium">App Version</Text>
            <Text className="text-slate-400">1.0.0</Text>
          </View>
        </Card>

        {/* Actions */}
        <Button title="Logout" variant="outline" onPress={handleLogout} />
        <View className="mt-3">
          <Button title="Delete Account" variant="danger" onPress={handleDeleteAccount} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}