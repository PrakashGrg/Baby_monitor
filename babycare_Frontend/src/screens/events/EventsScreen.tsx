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

import { useFocusEffect } from '@react-navigation/native';

import { getEvents, Event } from '../../api/events';
import { getBabies, Baby } from '../../api/babies';

import Card from '../../components/Card';

type FilterType = 'all' | 'motion' | 'cry';

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [babies, setBabies] = useState<Baby[]>([]);

  const [filter, setFilter] =
    useState<FilterType>('all');

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  // -----------------------------------------
  // Load Events
  // -----------------------------------------

  const loadData = useCallback(async () => {
    try {
      const [
        eventsData,
        babiesData,
      ] = await Promise.all([
        getEvents(),
        getBabies(),
      ]);

      setEvents(eventsData);
      setBabies(babiesData);
    } catch (err) {
      console.error(
        'Failed to load events:',
        err
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // -----------------------------------------
  // Reload When Screen Focuses
  // -----------------------------------------

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // -----------------------------------------
  // Pull To Refresh
  // -----------------------------------------

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // -----------------------------------------
  // Filter Events
  // -----------------------------------------

  const filteredEvents =
    filter === 'all'
      ? events
      : events.filter(
          (event) =>
            event.type === filter
        );

  // -----------------------------------------
  // Format Time
  // -----------------------------------------

  const formatTime = (
    timestamp: string
  ) => {
    const date = new Date(timestamp);

    return date.toLocaleString(
      undefined,
      {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  // -----------------------------------------
  // Event Icon
  // -----------------------------------------

  const getEventIcon = (
    type: string
  ) => {
    if (type === 'motion') {
      return require(
        '../../../assets/Motion Alerts.png'
      );
    }

    return require(
      '../../../assets/baby.png'
    );
  };

  // -----------------------------------------
  // Event Title
  // -----------------------------------------

  const getEventTitle = (
    type: string
  ) => {
    if (type === 'motion') {
      return 'Motion Detected';
    }

    return 'Cry Detected';
  };

  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View className="px-6 pt-14 pb-4">

        <View className="flex-row items-center mb-1">

          <Image
            source={require(
              '../../../assets/Event.png'
            )}
            className="w-10 h-10 mr-3"
            resizeMode="contain"
          />

          <Text className="text-2xl font-semibold text-slate-900">
            Event History
          </Text>

        </View>

        <Text className="text-sm text-slate-500 ml-13">
          View your baby's recent activity and alerts.
        </Text>

      </View>

      {/* ================================================= */}
      {/* FILTERS */}
      {/* ================================================= */}

      {babies.length > 0 && (
        <View className="px-6 pb-4">

          <View className="flex-row gap-2">

            {(
              ['all', 'motion', 'cry'] as FilterType[]
            ).map((item) => {

              const selected =
                filter === item;

              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.75}
                  onPress={() =>
                    setFilter(item)
                  }
                  className={`px-5 py-2.5 rounded-xl border ${
                    selected
                      ? 'bg-slate-900 border-slate-900'
                      : 'bg-white border-slate-200'
                  }`}
                >

                  <Text
                    className={`text-sm font-medium capitalize ${
                      selected
                        ? 'text-white'
                        : 'text-slate-600'
                    }`}
                  >
                    {item}
                  </Text>

                </TouchableOpacity>
              );
            })}

          </View>

        </View>
      )}

      {/* ================================================= */}
      {/* LOADING */}
      {/* ================================================= */}

      {loading ? (

        <View className="flex-1 items-center justify-center">

          <Text className="text-slate-400">
            Loading events...
          </Text>

        </View>

      ) : filteredEvents.length === 0 ? (

        /* ================================================= */
        /* EMPTY STATE */
        /* ================================================= */

        <View className="flex-1 items-center justify-center px-8">

          <View className="w-20 h-20 rounded-2xl bg-slate-100 items-center justify-center mb-5">

            <Image
              source={require(
                '../../../assets/Event.png'
              )}
              className="w-11 h-11"
              resizeMode="contain"
            />

          </View>

          <Text className="text-xl font-semibold text-slate-900 mb-2">
            No events yet
          </Text>

          <Text className="text-sm text-slate-400 text-center leading-5">
            Motion and cry detections will appear here
            when activity is detected.
          </Text>

        </View>

      ) : (

        /* ================================================= */
        /* EVENT LIST */
        /* ================================================= */

        <FlatList
          data={filteredEvents}
          keyExtractor={(item) =>
            item.id.toString()
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 4,
            paddingBottom: 40,
            gap: 12,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#334155"
            />
          }
          renderItem={({ item }) => (

            <Card className="flex-row items-center">

              {/* ================================================= */}
              {/* SNAPSHOT / EVENT ICON */}
              {/* ================================================= */}

              {item.snapshot ? (

                <Image
                  source={{
                    uri: item.snapshot,
                  }}
                  className="w-16 h-16 rounded-2xl mr-4"
                  resizeMode="cover"
                />

              ) : (

                <View className="w-16 h-16 rounded-2xl bg-slate-100 items-center justify-center mr-4">

                  <Image
                    source={getEventIcon(
                      item.type
                    )}
                    className="w-9 h-9"
                    resizeMode="contain"
                  />

                </View>

              )}

              {/* ================================================= */}
              {/* EVENT INFORMATION */}
              {/* ================================================= */}

              <View className="flex-1">

                <Text className="text-base font-semibold text-slate-900">
                  {getEventTitle(
                    item.type
                  )}
                </Text>

                <Text className="text-sm text-slate-500 mt-1">
                  {item.baby_name}
                </Text>

                <Text className="text-xs text-slate-400 mt-1">
                  {formatTime(
                    item.timestamp
                  )}
                </Text>

              </View>

              {/* ================================================= */}
              {/* EVENT TYPE */}
              {/* ================================================= */}

              <View className="ml-2">

                <View className="px-3 py-1.5 rounded-lg bg-slate-100">

                  <Text className="text-xs font-medium text-slate-600 capitalize">
                    {item.type}
                  </Text>

                </View>

              </View>

            </Card>

          )}
        />

      )}

    </SafeAreaView>
  );
}