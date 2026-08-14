import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SettingsStackParamList } from '../../types/navigation';
import Card from '../../components/Card';
import Button from '../../components/Button';

import { useAuthStore } from '../../store/authStore';
import { deleteAccount } from '../../api/auth';
import { useThemeStore } from '../../store/themeStore';

type NavigationProp = NativeStackNavigationProp<
  SettingsStackParamList,
  'SettingsMain'
>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [notifications, setNotifications] = useState(true);

  const isDark = useThemeStore((state) => state.isDark);
  const toggleDark = useThemeStore((state) => state.toggleDark);

  // -----------------------------------------
  // Logout
  // -----------------------------------------

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  // -----------------------------------------
  // Delete Account
  // -----------------------------------------

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              await logout();
            } catch (err) {
              Alert.alert(
                'Error',
                'Could not delete account. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <View className="px-6 pt-14 pb-4">

          <Text className="text-3xl font-bold text-slate-900">
            Settings
          </Text>

          <Text className="text-sm text-slate-500 mt-1">
            Manage your account and app preferences
          </Text>

        </View>


        {/* ========================================= */}
        {/* ACCOUNT */}
        {/* ========================================= */}

        <View className="px-6">

          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Account
          </Text>

          <Card className="mb-6">

            {/* Profile */}
            <View className="flex-row items-center mb-4">

              <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mr-4">

                <Text className="text-3xl">
                  👤
                </Text>

              </View>

              <View className="flex-1">

                <Text className="font-bold text-slate-900 text-lg">
                  {user?.username || 'User'}
                </Text>

                <Text className="text-slate-400 text-sm mt-1">
                  {user?.email || ''}
                </Text>

              </View>

            </View>

            <View className="h-px bg-slate-100 mb-3" />

            {/* Edit Profile */}

            <TouchableOpacity
              activeOpacity={0.7}
              className="py-3 flex-row items-center justify-between"
              onPress={() =>
                navigation.navigate('EditProfile')
              }
            >

              <View>
                <Text className="text-slate-900 font-semibold">
                  Edit Profile
                </Text>

                <Text className="text-slate-400 text-xs mt-1">
                  Update your personal information
                </Text>
              </View>

              <Text className="text-slate-300 text-2xl">
                ›
              </Text>

            </TouchableOpacity>

            {/* Change Password */}

            <TouchableOpacity
              activeOpacity={0.7}
              className="py-3 flex-row items-center justify-between"
              onPress={() =>
                navigation.navigate('ChangePassword')
              }
            >

              <View>
                <Text className="text-slate-900 font-semibold">
                  Change Password
                </Text>

                <Text className="text-slate-400 text-xs mt-1">
                  Keep your account secure
                </Text>
              </View>

              <Text className="text-slate-300 text-2xl">
                ›
              </Text>

            </TouchableOpacity>

          </Card>


          {/* ========================================= */}
          {/* DIAGNOSTICS */}
          {/* ========================================= */}

          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Diagnostics
          </Text>

          <Card className="mb-6">

            <TouchableOpacity
              activeOpacity={0.7}
              className="py-3 flex-row items-center justify-between"
              onPress={() =>
                navigation.navigate('SystemLogs')
              }
            >

              <View>

                <Text className="text-slate-900 font-semibold">
                  System Logs
                </Text>

                <Text className="text-slate-400 text-xs mt-1">
                  View operational activity and diagnostics
                </Text>

              </View>

              <Text className="text-slate-300 text-2xl">
                ›
              </Text>

            </TouchableOpacity>

          </Card>


          {/* ========================================= */}
          {/* PREFERENCES */}
          {/* ========================================= */}

          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Preferences
          </Text>

          <Card className="mb-6">

            {/* Notifications */}

            <View className="flex-row items-center justify-between py-2">

              <View className="flex-1 mr-4">

                <Text className="text-slate-900 font-semibold">
                  Push Notifications
                </Text>

                <Text className="text-slate-400 text-xs mt-1">
                  Receive motion and cry alerts
                </Text>

              </View>

              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: '#e2e8f0',
                  true: '#93c5fd',
                }}
                thumbColor={
                  notifications
                    ? '#2563eb'
                    : '#f4f4f5'
                }
              />

            </View>

            <View className="h-px bg-slate-100 my-3" />

            {/* Dark Mode */}

            <View className="flex-row items-center justify-between py-2">

              <View className="flex-1 mr-4">

                <Text className="text-slate-900 font-semibold">
                  Dark Mode
                </Text>

                <Text className="text-slate-400 text-xs mt-1">
                  Easier on the eyes at night
                </Text>

              </View>

              <Switch
                value={isDark}
                onValueChange={toggleDark}
                trackColor={{
                  false: '#e2e8f0',
                  true: '#93c5fd',
                }}
                thumbColor={
                  isDark
                    ? '#2563eb'
                    : '#f4f4f5'
                }
              />

            </View>

          </Card>


          {/* ========================================= */}
          {/* ABOUT */}
          {/* ========================================= */}

          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            About
          </Text>

          <Card className="mb-6">

            <View className="flex-row items-center justify-between py-2">

              <View>

                <Text className="text-slate-900 font-semibold">
                  Baby Care
                </Text>

                <Text className="text-slate-400 text-xs mt-1">
                  Safe. Connected. Always Watching.
                </Text>

              </View>

              <Text className="text-slate-400 text-sm">
                v1.0.0
              </Text>

            </View>

          </Card>


          {/* ========================================= */}
          {/* ACTIONS */}
          {/* ========================================= */}

          <Button
            title="Logout"
            variant="outline"
            onPress={handleLogout}
          />

          <View className="mt-3">

            <Button
              title="Delete Account"
              variant="danger"
              onPress={handleDeleteAccount}
            />

          </View>


          {/* ========================================= */}
          {/* FOOTER */}
          {/* ========================================= */}

          <View className="items-center mt-8">

            <Text className="text-slate-400 text-xs">
              Baby Care Monitor
            </Text>

            <Text className="text-slate-300 text-xs mt-1">
              Safe. Connected. Always Watching.
            </Text>

          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}