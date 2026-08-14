import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';

import { BabiesStackParamList } from '../../types/navigation';
import { createBaby } from '../../api/babies';
import Input from '../../components/Input';
import Button from '../../components/Button';

type NavigationProp = NativeStackNavigationProp<
  BabiesStackParamList,
  'BabyAdd'
>;

export default function BabyAddScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [name, setName] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [gender, setGender] = useState<
    'male' | 'female' | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(
        'Missing name',
        "Please enter your baby's name."
      );
      return;
    }

    setLoading(true);

    try {
      await createBaby({
        name: name.trim(),
        dob: dob.toISOString().split('T')[0],
        gender,
      });

      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        'Error',
        'Could not save baby profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 14,
          paddingBottom: 40,
        }}
      >
        {/* Back */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          className="mb-3 self-start py-2"
        >
          <Text className="text-slate-700 text-base font-medium">
            Back
          </Text>
        </TouchableOpacity>

        {/* Logo */}
        <View className="items-center mb-5">
          <Image
            source={require('../../../assets/babycare-logo.png')}
            className="w-44 h-44"
            resizeMode="contain"
          />
        </View>

        {/* Header */}
        <View className="mb-7">
          <Text className="text-3xl font-bold text-slate-900 mb-2">
            Add Rooms
          </Text>

          <Text className="text-base text-slate-500 leading-6">
            Add your Rooms details to get started.
          </Text>
        </View>

        {/* Name */}
        <Input
          label="Name"
          placeholder="Baby's name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* Date of Birth */}
        <Text className="text-sm font-medium text-slate-700 mb-2">
          Date of Birth
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowPicker(true)}
          className="w-full bg-white rounded-xl px-4 py-4 border border-slate-200 mb-5"
        >
          <Text className="text-slate-900 text-base">
            {dob.toDateString()}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={dob}
            mode="date"
            display={
              Platform.OS === 'ios'
                ? 'spinner'
                : 'default'
            }
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowPicker(Platform.OS === 'ios');

              if (selectedDate) {
                setDob(selectedDate);
              }
            }}
          />
        )}

        {/* Gender */}
        <Text className="text-sm font-medium text-slate-700 mb-2">
          Gender
        </Text>

        <View className="flex-row gap-3 mb-7">
          {(['male', 'female'] as const).map((g) => {
            const selected = gender === g;

            return (
              <TouchableOpacity
                key={g}
                activeOpacity={0.7}
                onPress={() => setGender(g)}
                className={`flex-1 min-h-[52px] rounded-xl border items-center justify-center ${
                  selected
                    ? 'bg-slate-900 border-slate-900'
                    : 'bg-white border-slate-200'
                }`}
              >
                <Text
                  className={
                    selected
                      ? 'text-white font-semibold capitalize'
                      : 'text-slate-700 font-medium capitalize'
                  }
                >
                  {g}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save */}
        <Button
          title="Save Baby"
          onPress={handleSave}
          loading={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}