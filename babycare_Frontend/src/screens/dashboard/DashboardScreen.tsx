import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-slate-900">Dashboard</Text>
        <Text className="text-slate-500 mt-2">Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}