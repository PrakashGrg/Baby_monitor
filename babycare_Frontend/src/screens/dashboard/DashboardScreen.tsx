import React, { useCallback, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Card from '../../components/Card';
import { MainTabParamList } from '../../types/navigation';
import { getBabies, Baby } from '../../api/babies';
import { getEvents, Event } from '../../api/events';
import { useAuthStore } from '../../store/authStore';

type NavigationProp = BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((state) => state.user);

  const [babies, setBabies] = useState<Baby[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [babiesData, eventsData] = await Promise.all([getBabies(), getEvents()]);
      setBabies(babiesData);
      setEvents(eventsData);
    } catch (err) {
      console.error('Dashboard load error:', err);
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

  const motionCount = events.filter((e) => e.type === 'motion').length;
  const cryCount = events.filter((e) => e.type === 'cry').length;
  const recentEvents = events.slice(0, 3);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome header */}
        <Text className="text-base text-slate-500">{greeting()},</Text>
        <Text className="text-2xl font-bold text-slate-900 mb-6">
          {user?.username || 'Parent'} 👋
        </Text>

        {/* Quick stats */}
        <View className="flex-row gap-3 mb-6">
          <Card className="flex-1 items-center py-5">
            <Text className="text-3xl font-bold text-primary-600">{babies.length}</Text>
            <Text className="text-slate-500 text-sm mt-1">Babies</Text>
          </Card>
          <Card className="flex-1 items-center py-5">
            <Text className="text-3xl font-bold text-warning">{motionCount}</Text>
            <Text className="text-slate-500 text-sm mt-1">Motion</Text>
          </Card>
          <Card className="flex-1 items-center py-5">
            <Text className="text-3xl font-bold text-danger">{cryCount}</Text>
            <Text className="text-slate-500 text-sm mt-1">Cry</Text>
          </Card>
        </View>

        {/* Quick links */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            className="flex-1 bg-primary-600 rounded-2xl p-5"
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Babies')}
          >
            <Text className="text-3xl mb-2">👶</Text>
            <Text className="text-white font-semibold text-base">Manage Babies</Text>
            <Text className="text-primary-100 text-xs mt-1">Add or edit profiles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-accent rounded-2xl p-5"
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Events')}
          >
            <Text className="text-3xl mb-2">📋</Text>
            <Text className="text-white font-semibold text-base">Event History</Text>
            <Text className="text-purple-100 text-xs mt-1">View all activity</Text>
          </TouchableOpacity>
        </View>

        {/* Recent activity */}
        <Text className="text-lg font-bold text-slate-900 mb-3">Recent Activity</Text>

        {loading ? (
          <Text className="text-slate-400">Loading...</Text>
        ) : recentEvents.length === 0 ? (
          <Card>
            <Text className="text-slate-400 text-center py-4">No events yet</Text>
          </Card>
        ) : (
          <View className="gap-3">
            {recentEvents.map((event) => (
              <Card key={event.id} className="flex-row items-center">
                <Text className="text-2xl mr-3">
                  {event.type === 'motion' ? '🚶' : '👶'}
                </Text>
                <View className="flex-1">
                  <Text className="font-semibold text-slate-900 capitalize">
                    {event.type} detected
                  </Text>
                  <Text className="text-slate-400 text-xs mt-0.5">
                    {event.baby_name} • {new Date(event.timestamp).toLocaleString()}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}