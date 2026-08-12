import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      // Navigation happens automatically via RootNavigator watching isAuthenticated
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Invalid username or password';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 pt-8">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
              <Text className="text-primary-600 text-base">← Back</Text>
            </TouchableOpacity>

            <Text className="text-3xl font-bold text-slate-900 mb-2">Welcome back</Text>
            <Text className="text-base text-slate-500 mb-8">Login to continue monitoring</Text>

            <Input
              label="Username"
              placeholder="Enter your username"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error ? <Text className="text-danger text-sm mb-4">{error}</Text> : null}

            <View className="mt-2">
              <Button title="Login" onPress={handleLogin} loading={loading} />
            </View>

            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-500">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-primary-600 font-semibold">Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}