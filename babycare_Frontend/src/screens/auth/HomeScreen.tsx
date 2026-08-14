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
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">

        {/* Logo and Introduction */}
        <View className="flex-1 items-center justify-center">

          <Image
            source={require('../../../assets/babycare-logo.png')}
            className="w-40 h-40"
            resizeMode="contain"
          />

          <Text className="text-3xl font-semibold text-slate-900 text-center mt-7">
            Baby Care Monitor
          </Text>

          <Text className="text-base text-slate-500 text-center mt-3 px-8 leading-6">
            Keep an eye on your little one, wherever you are.
          </Text>

        </View>

        {/* Actions */}
        <View className="gap-3 pb-2">
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