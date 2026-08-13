import React, { useCallback, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BabiesStackParamList } from '../../types/navigation';
import { getBabies, Baby } from '../../api/babies';
import Card from '../../components/Card';
import Button from '../../components/Button';

type NavigationProp = NativeStackNavigationProp<BabiesStackParamList, 'BabyList'>;

function calculateAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 1) return 'Newborn';
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths > 0 ? `${years}y ${remMonths}mo` : `${years}y`;
}

export default function BabyListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [babies, setBabies] = useState<Baby[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBabies = useCallback(async () => {
    try {
      const data = await getBabies();
      setBabies(data);
    } catch (err) {
      console.error('Failed to load babies:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBabies();
    }, [loadBabies])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadBabies();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-slate-900">My Babies</Text>
        <TouchableOpacity
          className="bg-primary-600 w-10 h-10 rounded-full items-center justify-center"
          onPress={() => navigation.navigate('BabyAdd')}
        >
          <Text className="text-white text-2xl leading-none">+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-400">Loading...</Text>
        </View>
      ) : babies.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">👶</Text>
          <Text className="text-lg font-semibold text-slate-700 mb-1">No babies yet</Text>
          <Text className="text-slate-400 text-center mb-6">
            Add your baby's profile to start monitoring
          </Text>
          <Button title="Add Baby" onPress={() => navigation.navigate('BabyAdd')} fullWidth={false} />
        </View>
      ) : (
        <FlatList
          data={babies}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('BabyEdit', { babyId: item.id })}
              activeOpacity={0.7}
            >
              <Card className="flex-row items-center">
                <View className="w-14 h-14 bg-primary-100 rounded-full items-center justify-center mr-4">
                  <Text className="text-2xl">{item.gender === 'female' ? '👧' : '👶'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-slate-900">{item.name}</Text>
                  <Text className="text-slate-400 text-sm mt-0.5">{calculateAge(item.dob)}</Text>
                </View>
                <Text className="text-slate-300 text-xl">›</Text>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}