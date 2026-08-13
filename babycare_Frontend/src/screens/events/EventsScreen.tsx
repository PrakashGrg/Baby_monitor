import React, { useCallback, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getEvents, Event } from '../../api/events';
import { getBabies, Baby } from '../../api/babies';
import Card from '../../components/Card';

type FilterType = 'all' | 'motion' | 'cry';

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [babies, setBabies] = useState<Baby[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [eventsData, babiesData] = await Promise.all([getEvents(), getBabies()]);
      setEvents(eventsData);
      setBabies(babiesData);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredEvents = filter === 'all' ? events : events.filter((e) => e.type === filter);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-slate-900 mb-4">Event History</Text>

        {babies.length === 0 ? null : (
          <View className="flex-row gap-2 mb-2">
            {(['all', 'motion', 'cry'] as FilterType[]).map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                className={`px-4 py-2 rounded-full border ${
                  filter === f ? 'bg-primary-600 border-primary-600' : 'bg-white border-slate-200'
                }`}
              >
                <Text
                  className={`text-sm font-medium capitalize ${
                    filter === f ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-400">Loading...</Text>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">📋</Text>
          <Text className="text-lg font-semibold text-slate-700 mb-1">No events yet</Text>
          <Text className="text-slate-400 text-center">
            Motion and cry detections will show up here
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Card className="flex-row items-center">
              {item.snapshot ? (
                <Image
                  source={{ uri: item.snapshot }}
                  className="w-14 h-14 rounded-xl mr-4"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-14 h-14 bg-primary-100 rounded-xl items-center justify-center mr-4">
                  <Text className="text-2xl">{item.type === 'motion' ? '🚶' : '👶'}</Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="font-semibold text-slate-900 capitalize">
                  {item.type} detected
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  {item.baby_name} • {formatTime(item.timestamp)}
                </Text>
              </View>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}