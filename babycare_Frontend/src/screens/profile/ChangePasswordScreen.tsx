import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { changePassword } from '../../api/auth';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Could not change password.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6 py-2 -ml-1 self-start">
            <Text className="text-primary-600 text-lg font-semibold">← Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-slate-900 mb-6">Change Password</Text>

        <Input label="Current Password" secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
        <Input label="New Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
        <Input label="Confirm New Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

        <View className="mt-2">
          <Button title="Change Password" onPress={handleChange} loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}