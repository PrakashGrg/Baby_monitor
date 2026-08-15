import React, { useEffect, useState } from 'react';
import { View, Text, Image, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-12 pb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mb-4"
        >
          <Text className="text-slate-700 text-lg">‹</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-semibold text-slate-900">
          {mode === 'monitor' ? 'Start Monitoring' : 'View Live Feed'}
        </Text>
        <Text className="text-slate-500 text-sm mt-1">Select a baby to continue</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : babies.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Image
            source={require('../../../assets/baby.png')}
            className="w-16 h-16 mb-4"
            resizeMode="contain"
          />
          <Text className="text-slate-500 text-center">
            Add a baby profile first before monitoring.
          </Text>
        </View>
      ) : (
        <FlatList
          data={babies}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelect(item)} activeOpacity={0.75}>
              <Card className="flex-row items-center">
                <View className="w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center mr-4">
                  <Image
                    source={require('../../../assets/baby.png')}
                    className="w-8 h-8"
                    resizeMode="contain"
                  />
                </View>
                <Text className="text-base font-semibold text-slate-900 flex-1">{item.name}</Text>
                <Text className="text-slate-400 text-2xl">›</Text>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}