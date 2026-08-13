import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BabiesStackParamList } from '../../types/navigation';
import { getBaby, updateBaby, deleteBaby } from '../../api/babies';
import Input from '../../components/Input';
import Button from '../../components/Button';

type NavigationProp = NativeStackNavigationProp<BabiesStackParamList, 'BabyEdit'>;
type RouteProps = RouteProp<BabiesStackParamList, 'BabyEdit'>;

export default function BabyEditScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { babyId } = route.params;

  const [name, setName] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | undefined>(undefined);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const baby = await getBaby(babyId);
        setName(baby.name);
        setDob(new Date(baby.dob));
        setGender(baby.gender || undefined);
      } catch (err) {
        Alert.alert('Error', 'Could not load baby profile.');
        navigation.goBack();
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [babyId]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a name for your baby.');
      return;
    }
    setLoading(true);
    try {
      await updateBaby(babyId, {
        name: name.trim(),
        dob: dob.toISOString().split('T')[0],
        gender,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Could not update baby profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Baby', `Are you sure you want to delete ${name}'s profile? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBaby(babyId);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', 'Could not delete baby profile.');
          }
        },
      },
    ]);
  };

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
          <Text className="text-primary-600 text-base">← Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-slate-900 mb-6">Edit Baby</Text>

        <Input label="Name" placeholder="Baby's name" value={name} onChangeText={setName} />

        <Text className="text-sm font-medium text-slate-700 mb-1.5">Date of Birth</Text>
        <TouchableOpacity
          className="w-full bg-white rounded-xl px-4 py-3.5 border border-slate-200 mb-4"
          onPress={() => setShowPicker(true)}
        >
          <Text className="text-slate-900">{dob.toDateString()}</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={dob}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowPicker(Platform.OS === 'ios');
              if (selectedDate) setDob(selectedDate);
            }}
          />
        )}

        <Text className="text-sm font-medium text-slate-700 mb-1.5">Gender</Text>
        <View className="flex-row gap-3 mb-6">
          {(['male', 'female'] as const).map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setGender(g)}
              className={`flex-1 py-3 rounded-xl border items-center ${
                gender === g ? 'bg-primary-600 border-primary-600' : 'bg-white border-slate-200'
              }`}
            >
              <Text className={gender === g ? 'text-white font-semibold capitalize' : 'text-slate-700 capitalize'}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Save Changes" onPress={handleSave} loading={loading} />
        <View className="mt-3">
          <Button title="Delete Baby" variant="danger" onPress={handleDelete} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}