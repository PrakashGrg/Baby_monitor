import React from 'react';
import { View, Text, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Button from '../../components/Button';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-between px-6 py-10">
        {/* Top: Logo/Illustration area */}
        <View className="flex-1 items-center justify-center">
          <View className="w-28 h-28 bg-primary-100 rounded-3xl items-center justify-center mb-6">
            <Text className="text-5xl">👶</Text>
          </View>
          <Text className="text-3xl font-bold text-slate-900 text-center">
            Baby Care{'\n'}Monitor
          </Text>
          <Text className="text-base text-slate-500 text-center mt-3 px-4">
            Keep an eye on your little one, wherever you are.
          </Text>
        </View>

        {/* Bottom: Actions */}
        <View className="gap-3">
          <Button
            title="Login"
            variant="primary"
            onPress={() => navigation.navigate('Login')}
          />
          <Button
            title="Create Account"
            variant="outline"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}