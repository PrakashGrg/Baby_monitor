import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
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
  'Register'
>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();

  const register = useAuthStore((state) => state.register);

  // -----------------------------
  // Form State
  // -----------------------------

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Register
  // -----------------------------

  const handleRegister = async () => {
    // Validate empty fields
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert(
        'Missing fields',
        'Please fill in all fields.'
      );
      return;
    }

    // Validate password
    if (password !== confirmPassword) {
      Alert.alert(
        'Invalid',
        'Passwords do not match.'
      );
      return;
    }

    // Validate password length
    if (password.length < 8) {
      Alert.alert(
        'Invalid password',
        'Password must be at least 8 characters.'
      );
      return;
    }

    setLoading(true);

    try {
      await register({
        username,
        email,
        password,
      });

      // RootNavigator should handle navigation
      // after authentication.
    } catch (err: any) {
      const data = err?.response?.data;

      const message = data
        ? Object.values(data)
            .flat()
            .join('\n')
        : 'Something went wrong. Please try again.';

      Alert.alert(
        'Registration Failed',
        message
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <SafeAreaView className="flex-1 bg-background">

      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        className="flex-1"
      >

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <View className="flex-1 px-6 pt-10 pb-8">

            {/* ================================= */}
            {/* LOGO */}
            {/* ================================= */}

            <View className="items-center mb-6">

              <Image
                source={require('../../../assets/babycare-logo.png')}
                className="w-200 h-200"
                resizeMode="contain"
              />

              <Text className="text-sm font-semibold text-primary-600 tracking-wide mt-2">
                SAFE. CONNECTED. ALWAYS WATCHING.
              </Text>

            </View>

            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <View className="mb-7">

              <Text className="text-3xl font-bold text-slate-900 mb-2">
                Register
              </Text>

              <Text className="text-base text-slate-500">
                Create an account to start monitoring your baby.
              </Text>

            </View>

            {/* ================================= */}
            {/* USERNAME */}
            {/* ================================= */}

            <Input
              label="Username"
              placeholder="Enter your username"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />

            {/* ================================= */}
            {/* EMAIL */}
            {/* ================================= */}

            <Input
              label="Email Address"
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {/* ================================= */}
            {/* PASSWORD */}
            {/* ================================= */}

            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* ================================= */}
            {/* CONFIRM PASSWORD */}
            {/* ================================= */}

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {/* ================================= */}
            {/* SIGN UP BUTTON */}
            {/* ================================= */}

            <View className="mt-3">

              <Button
                title={
                  loading
                    ? 'Signing Up...'
                    : 'Sign Up'
                }
                onPress={handleRegister}
                loading={loading}
              />

            </View>

            {/* ================================= */}
            {/* LOGIN LINK */}
            {/* ================================= */}

            <View className="flex-row justify-center mt-7">

              <Text className="text-slate-500">
                Already have an account?{' '}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Login')
                }
              >

                <Text className="text-primary-600 font-semibold">
                  Log In
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}