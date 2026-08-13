import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import Button from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

export default function SettingsScreen() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-slate-900 mb-2">Settings</Text>
        <Text className="text-slate-500 mb-8">Coming soon</Text>
        <Button title="Logout" variant="danger" onPress={logout} />
      </View>
    </SafeAreaView>
  );
}