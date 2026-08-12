import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const register = useAuthStore((state) => state.register);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Missing fields', 'Please fill in username, email, and password.');
      return;
    }
    setLoading(true);
    try {
      await register({ username, email, phone, password });
      // Navigation happens automatically via RootNavigator watching isAuthenticated
    } catch (err: any) {
      const data = err.response?.data;
      const message = data
        ? Object.values(data).flat().join('\n')
        : 'Something went wrong. Please try again.';
      Alert.alert('Registration Failed', message);
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
          <View className="flex-1 px-6 pt-8 pb-6">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
              <Text className="text-primary-600 text-base">← Back</Text>
            </TouchableOpacity>

            <Text className="text-3xl font-bold text-slate-900 mb-2">Create account</Text>
            <Text className="text-base text-slate-500 mb-8">Start monitoring your baby today</Text>

            <Input
              label="Username"
              placeholder="Choose a username"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
            <Input
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Phone (optional)"
              placeholder="98XXXXXXXX"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <Input
              label="Password"
              placeholder="At least 8 characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View className="mt-2">
              <Button title="Create Account" onPress={handleRegister} loading={loading} />
            </View>

            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-500">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-primary-600 font-semibold">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}