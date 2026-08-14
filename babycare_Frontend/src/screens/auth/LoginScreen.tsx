import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../types/navigation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err: any) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 28,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View className="items-center mb-8">
            <Image
              source={require('../../../assets/babycare-logo.png')}
              className="w-200 h-200"
              resizeMode="contain"
            />
          </View>

          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-semibold text-slate-900 mb-2">
              Welcome back
            </Text>

            <Text className="text-base text-slate-500 leading-6">
              Sign in to continue monitoring your baby.
            </Text>
          </View>

          {/* Form */}
          <View>
            <Input
              label="Email Address"
              placeholder="Enter your email or username"
              autoCapitalize="none"
              keyboardType="email-address"
              value={username}
              onChangeText={setUsername}
              error={error ? ' ' : undefined}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={error ? ' ' : undefined}
            />

            {/* Error */}
            {error ? (
              <View className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">
                <Text className="text-red-600 text-sm">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Remember / Forgot */}
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center"
              >
                <View className="w-5 h-5 border border-slate-300 rounded mr-2" />

                <Text className="text-sm text-slate-600">
                  Remember me
                </Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-sm text-slate-900 font-medium">
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
            />
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-7">
            <View className="flex-1 h-px bg-slate-200" />

            <Text className="text-slate-400 mx-4 text-xs font-medium">
              OR
            </Text>

            <View className="flex-1 h-px bg-slate-200" />
          </View>

          {/* Google */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="w-full border border-slate-200 rounded-xl py-4 items-center justify-center"
          >
            <Text className="text-slate-800 font-medium">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Register */}
          <View className="flex-row justify-center mt-auto pt-8">
            <Text className="text-slate-500">
              Don't have an account?{' '}
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Register')}
            >
              <Text className="text-slate-900 font-semibold">
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}