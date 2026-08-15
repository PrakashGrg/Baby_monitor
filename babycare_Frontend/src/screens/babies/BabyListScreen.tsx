import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import {
  BabiesStackParamList,
} from '../../types/navigation';

import {
  getBabies,
  Baby,
} from '../../api/babies';

import Card from '../../components/Card';
import Button from '../../components/Button';

type NavigationProp =
  NativeStackNavigationProp<
    BabiesStackParamList,
    'BabyList'
  >;

function calculateAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();

  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  if (months < 1) {
    return 'Newborn';
  }

  if (months < 12) {
    return `${months} mo`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  return remainingMonths > 0
    ? `${years}y ${remainingMonths}mo`
    : `${years}y`;
}

export default function BabyListScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const [babies, setBabies] =
    useState<Baby[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  // -----------------------------------------
  // Load Babies
  // -----------------------------------------

  const loadBabies = useCallback(async () => {
    try {
      const data = await getBabies();

      setBabies(data);
    } catch (err) {
      console.error(
        'Failed to load babies:',
        err
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // -----------------------------------------
  // Reload when screen focuses
  // -----------------------------------------

  useFocusEffect(
    useCallback(() => {
      loadBabies();
    }, [loadBabies])
  );

  // -----------------------------------------
  // Pull to Refresh
  // -----------------------------------------

  const onRefresh = () => {
    setRefreshing(true);
    loadBabies();
  };

  // -----------------------------------------
  // Render
  // -----------------------------------------

  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <View className="px-6 pt-20 pb-4">

        <View className="flex-row items-center justify-between">

          <View className="flex-1">

            <Text className="text-3xl font-bold text-slate-900">
              Rooms
            </Text>

            <Text className="text-base text-slate-500 mt-1">
              Manage your baby rooms
            </Text>

          </View>

          {/* Add button */}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('BabyAdd')
            }
            className="w-12 h-12 rounded-xl bg-slate-900 items-center justify-center"
          >
            <Text className="text-white text-2xl font-light">
              +
            </Text>
          </TouchableOpacity>

        </View>

      </View>

      {/* ===================================== */}
      {/* LOADING */}
      {/* ===================================== */}

      {loading ? (

        <View className="flex-1 items-center justify-center">

          <Text className="text-slate-400">
            Loading rooms...
          </Text>

        </View>

      ) : babies.length === 0 ? (

        /* =================================== */
        /* EMPTY STATE */
        /* =================================== */

        <View className="flex-1 items-center justify-center px-8">

          <Image
            source={require('../../../assets/babycare-logo.png')}
            className="w-40 h-40 mb-5"
            resizeMode="contain"
          />

          <Text className="text-xl font-bold text-slate-900 mb-2">
            No rooms yet
          </Text>

          <Text className="text-slate-500 text-center leading-6 mb-7">
            Add a baby room to start monitoring
            your little one.
          </Text>

          <Button
            title="Add Room"
            onPress={() =>
              navigation.navigate('BabyAdd')
            }
            fullWidth={false}
          />

        </View>

      ) : (

        /* =================================== */
        /* BABY LIST */
        /* =================================== */

        <FlatList
          data={babies}
          keyExtractor={(item) =>
            item.id.toString()
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          renderItem={({ item }) => (

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() =>
                navigation.navigate(
                  'BabyEdit',
                  {
                    babyId: item.id,
                  }
                )
              }
              className="mb-3"
            >

              <Card className="flex-row items-center">

                {/* Room logo */}

                <View className="w-16 h-16 rounded-xl bg-slate-50 items-center justify-center mr-4">

                  <Image
                    source={require('../../../assets/babycare-logo.png')}
                    className="w-14 h-14"
                    resizeMode="contain"
                  />

                </View>

                {/* Room information */}

                <View className="flex-1">

                  <Text className="text-lg font-semibold text-slate-900">
                    {item.name}
                  </Text>

                  <Text className="text-slate-500 text-sm mt-1">
                    {calculateAge(item.dob)}
                  </Text>

                  <Text className="text-slate-400 text-xs mt-1">
                    {item.gender === 'female'
                      ? 'Female'
                      : 'Male'}
                  </Text>

                </View>

                {/* Arrow */}

                <Text className="text-slate-400 text-2xl">
                  ›
                </Text>

              </Card>

            </TouchableOpacity>

          )}
        />

      )}

    </SafeAreaView>
  );
}