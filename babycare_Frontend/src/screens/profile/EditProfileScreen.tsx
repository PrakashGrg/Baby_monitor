import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { updateProfile } from '../../api/auth';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!username.trim() || !email.trim()) {
      Alert.alert('Missing fields', 'Username and email are required.');
      return;
    }
    setLoading(true);
    try {
      const updated = await updateProfile({ username, email, phone });
      setUser(updated);
      Alert.alert('Success', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const data = err.response?.data;
      const message = data ? Object.values(data).flat().join('\n') : 'Could not update profile.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-slate-900">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6 py-2 -ml-1 self-start">
  <Text className="text-primary-600 text-lg font-semibold">← Back</Text>
</TouchableOpacity>a

        <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Edit Profile</Text>

        <Input label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <View className="mt-2">
          <Button title="Save Changes" onPress={handleSave} loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}