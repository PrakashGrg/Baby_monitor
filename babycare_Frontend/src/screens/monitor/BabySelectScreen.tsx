import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { getBabies, Baby } from '../../api/babies';
import Card from '../../components/Card';

export default function BabySelectScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: { mode: 'monitor' | 'viewer' } }, 'params'>>();
  const mode = route.params.mode;

  const [babies, setBabies] = useState<Baby[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getBabies();
        setBabies(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = (baby: Baby) => {
    if (mode === 'monitor') {
      navigation.navigate('Monitor', { babyId: baby.id, babyName: baby.name });
    } else {
      navigation.navigate('Viewer', { babyId: baby.id, babyName: baby.name });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
          <Text className="text-primary-600 text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-slate-900">
          {mode === 'monitor' ? 'Start Monitoring' : 'View Live Feed'}
        </Text>
        <Text className="text-slate-500 mt-1">Select a baby to continue</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : babies.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">👶</Text>
          <Text className="text-slate-500 text-center">
            Add a baby profile first before monitoring.
          </Text>
        </View>
      ) : (
        <FlatList
          data={babies}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelect(item)} activeOpacity={0.7}>
              <Card className="flex-row items-center">
                <View className="w-14 h-14 bg-primary-100 rounded-full items-center justify-center mr-4">
                  <Text className="text-2xl">{item.gender === 'female' ? '👧' : '👶'}</Text>
                </View>
                <Text className="text-base font-semibold text-slate-900 flex-1">{item.name}</Text>
                <Text className="text-slate-300 text-xl">›</Text>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}