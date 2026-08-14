import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';

import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';

import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import DateTimePicker from '@react-native-community/datetimepicker';

import { BabiesStackParamList } from '../../types/navigation';
import {
  getBaby,
  updateBaby,
  deleteBaby,
} from '../../api/babies';

import Input from '../../components/Input';
import Button from '../../components/Button';

type NavigationProp =
  NativeStackNavigationProp<
    BabiesStackParamList,
    'BabyEdit'
  >;

type RouteProps =
  RouteProp<
    BabiesStackParamList,
    'BabyEdit'
  >;

export default function BabyEditScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const route =
    useRoute<RouteProps>();

  const { babyId } = route.params;

  const [name, setName] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showPicker, setShowPicker] =
    useState(false);

  const [gender, setGender] = useState<
    'male' | 'female' | undefined
  >(undefined);

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  // -----------------------------------------
  // Load Baby
  // -----------------------------------------

  useEffect(() => {
    const loadBaby = async () => {
      try {
        const baby = await getBaby(babyId);

        setName(baby.name);
        setDob(new Date(baby.dob));
        setGender(
          baby.gender || undefined
        );
      } catch (err) {
        Alert.alert(
          'Error',
          'Could not load baby profile.'
        );

        navigation.goBack();
      } finally {
        setInitialLoading(false);
      }
    };

    loadBaby();
  }, [babyId, navigation]);

  // -----------------------------------------
  // Save Changes
  // -----------------------------------------

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
      await updateBaby(babyId, {
        name: name.trim(),
        dob: dob
          .toISOString()
          .split('T')[0],
        gender,
      });

      navigation.goBack();
    } catch (err) {
      Alert.alert(
        'Error',
        'Could not update baby profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Delete Baby
  // -----------------------------------------

  const handleDelete = () => {
    Alert.alert(
      'Delete Baby',
      `Are you sure you want to delete ${name}'s profile? This cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {
            setDeleteLoading(true);

            try {
              await deleteBaby(babyId);

              navigation.goBack();
            } catch (err) {
              Alert.alert(
                'Error',
                'Could not delete baby profile.'
              );
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ]
    );
  };

  // -----------------------------------------
  // Initial Loading
  // -----------------------------------------

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator
          size="large"
          color="#0f172a"
        />

        <Text className="text-slate-500 mt-4">
          Loading baby profile...
        </Text>
      </SafeAreaView>
    );
  }

  // -----------------------------------------
  // UI
  // -----------------------------------------

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
        {/* ----------------------------------- */}
        {/* Back */}
        {/* ----------------------------------- */}

        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
          activeOpacity={0.7}
          className="self-start py-2 mb-3"
        >
          <Text className="text-slate-700 text-base font-medium">
            Back
          </Text>
        </TouchableOpacity>

        {/* ----------------------------------- */}
        {/* Logo */}
        {/* ----------------------------------- */}

        <View className="items-center mb-5">
          <Image
            source={require('../../../assets/babycare-logo.png')}
            className="w-44 h-44"
            resizeMode="contain"
          />
        </View>

        {/* ----------------------------------- */}
        {/* Header */}
        {/* ----------------------------------- */}

        <View className="mb-7">
          <Text className="text-3xl font-bold text-slate-900 mb-2">
            Edit Baby
          </Text>

          <Text className="text-base text-slate-500 leading-6">
            Update your baby's profile information.
          </Text>
        </View>

        {/* ----------------------------------- */}
        {/* Name */}
        {/* ----------------------------------- */}

        <Input
          label="Name"
          placeholder="Baby's name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* ----------------------------------- */}
        {/* Date of Birth */}
        {/* ----------------------------------- */}

        <Text className="text-sm font-medium text-slate-700 mb-2">
          Date of Birth
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            setShowPicker(true)
          }
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
            onChange={(
              event,
              selectedDate
            ) => {
              setShowPicker(
                Platform.OS === 'ios'
              );

              if (selectedDate) {
                setDob(selectedDate);
              }
            }}
          />
        )}

        {/* ----------------------------------- */}
        {/* Gender */}
        {/* ----------------------------------- */}

        <Text className="text-sm font-medium text-slate-700 mb-2">
          Gender
        </Text>

        <View className="flex-row gap-3 mb-7">
          {(
            ['male', 'female'] as const
          ).map((g) => {
            const selected =
              gender === g;

            return (
              <TouchableOpacity
                key={g}
                activeOpacity={0.7}
                onPress={() =>
                  setGender(g)
                }
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

        {/* ----------------------------------- */}
        {/* Save */}
        {/* ----------------------------------- */}

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
        />

        {/* ----------------------------------- */}
        {/* Delete */}
        {/* ----------------------------------- */}

        <TouchableOpacity
          activeOpacity={0.7}
          disabled={deleteLoading}
          onPress={handleDelete}
          className="mt-4 h-12 rounded-xl border border-red-200 bg-white items-center justify-center"
        >
          {deleteLoading ? (
            <ActivityIndicator
              size="small"
              color="#dc2626"
            />
          ) : (
            <Text className="text-red-600 font-semibold">
              Delete Baby
            </Text>
          )}
        </TouchableOpacity>

        {/* ----------------------------------- */}
        {/* Bottom spacing / information */}
        {/* ----------------------------------- */}

        <View className="items-center mt-8">
          <Text className="text-slate-400 text-xs text-center">
            Changes to this profile will be used
            for baby monitoring.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}