import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import Card from '../../components/Card';

import {
  getBabies,
  Baby,
} from '../../api/babies';

import {
  getEvents,
  Event,
} from '../../api/events';

import { useAuthStore } from '../../store/authStore';

type NavigationProp = any;

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();

  const user = useAuthStore((state) => state.user);

  const [babies, setBabies] = useState<Baby[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // -----------------------------------------
  // Load Dashboard Data
  // -----------------------------------------

  const loadData = useCallback(async () => {
    try {
      const [babiesData, eventsData] = await Promise.all([
        getBabies(),
        getEvents(),
      ]);

      setBabies(babiesData);
      setEvents(eventsData);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // -----------------------------------------
  // Reload Dashboard
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
  // Statistics
  // -----------------------------------------

  const motionCount = events.filter(
    (event) => event.type === 'motion'
  ).length;

  const cryCount = events.filter(
    (event) => event.type === 'cry'
  ).length;

  const recentEvents = events.slice(0, 3);

  // -----------------------------------------
  // Greeting
  // -----------------------------------------

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Good morning';
    }

    if (hour < 18) {
      return 'Good afternoon';
    }

    return 'Good evening';
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#334155"
          />
        }
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View className="flex-row items-center justify-between mb-8">
          <View className="flex-1 pr-4">
            <Text className="text-sm text-slate-500">
              {getGreeting()}
            </Text>

            <Text className="text-3xl font-semibold text-slate-900 mt-1">
              Hi, {user?.username || 'Parent'}
            </Text>

            <Text className="text-sm text-slate-500 mt-2 leading-5">
              Keep an eye on your little one.
            </Text>
          </View>

          {/* Baby Care Logo */}

          <Image
            source={require('../../../assets/babycare-logo.png')}
            className="w-40 h-40"
            resizeMode="contain"
          />
        </View>

        {/* ================================================= */}
        {/* OVERVIEW */}
        {/* ================================================= */}

        <View className="mb-8">
          <Text className="text-xl font-semibold text-slate-900 mb-4">
            Overview
          </Text>

          <View className="flex-row gap-3">

            {/* ROOMS */}

            <Card className="flex-1 items-center py-5">
              <View className="w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center mb-3">
                <Image
                  source={require('../../../assets/house.png')}
                  className="w-8 h-8"
                  resizeMode="contain"
                />
              </View>

              <Text className="text-2xl font-semibold text-slate-900">
                {babies.length}
              </Text>

              <Text className="text-slate-500 text-xs mt-1">
                Rooms
              </Text>
            </Card>

            {/* MOTION */}

            <Card className="flex-1 items-center py-5">
              <View className="w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center mb-3">
                <Image
                  source={require('../../../assets/Motion Alerts.png')}
                  className="w-8 h-8"
                  resizeMode="contain"
                />
              </View>

              <Text className="text-2xl font-semibold text-slate-900">
                {motionCount}
              </Text>

              <Text className="text-slate-500 text-xs mt-1 text-center">
                Motion Alerts
              </Text>
            </Card>

            {/* CRY */}

            <Card className="flex-1 items-center py-5">
              <View className="w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center mb-3">
                <Image
                  source={require('../../../assets/baby.png')}
                  className="w-8 h-8"
                  resizeMode="contain"
                />
              </View>

              <Text className="text-2xl font-semibold text-slate-900">
                {cryCount}
              </Text>

              <Text className="text-slate-500 text-xs mt-1 text-center">
                Cry Alerts
              </Text>
            </Card>

          </View>
        </View>

        {/* ================================================= */}
        {/* MANAGE ROOMS */}
        {/* ================================================= */}

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => navigation.navigate('Babies')}
          className="bg-slate-900 rounded-2xl p-5 mb-3"
        >
          <View className="flex-row items-center">

            <View className="w-14 h-14 rounded-2xl bg-white items-center justify-center mr-4">
              <Image
                source={require('../../../assets/house.png')}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </View>

            <View className="flex-1">
              <Text className="text-white font-semibold text-lg">
                Manage Rooms
              </Text>

              <Text className="text-slate-300 text-sm mt-1">
                Add, edit or manage your baby rooms
              </Text>
            </View>

            <Text className="text-white text-2xl">
              ›
            </Text>

          </View>
        </TouchableOpacity>

        {/* ================================================= */}
        {/* MANAGE ALERTS */}
        {/* ================================================= */}

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => navigation.navigate('Events')}
          className="bg-white border border-slate-200 rounded-2xl p-5 mb-8"
        >
          <View className="flex-row items-center">

            <View className="w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center mr-4">
              <Image
                source={require('../../../assets/Notification Bell.png')}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </View>

            <View className="flex-1">
              <Text className="text-slate-900 font-semibold text-lg">
                Manage Alerts
              </Text>

              <Text className="text-slate-500 text-sm mt-1">
                View motion and cry activity
              </Text>
            </View>

            <Text className="text-slate-500 text-2xl">
              ›
            </Text>

          </View>
        </TouchableOpacity>

        {/* ================================================= */}
        {/* BABY MONITOR */}
        {/* ================================================= */}

        <View className="mb-4">
          <Text className="text-xl font-semibold text-slate-900">
            Baby Monitor
          </Text>

          <Text className="text-sm text-slate-500 mt-1">
            Choose how you want to monitor your baby.
          </Text>
        </View>

        <View className="gap-3 mb-8">

          {/* START MONITORING */}

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() =>
              navigation.navigate('BabySelect', {
                mode: 'monitor',
              })
            }
            className="bg-slate-900 rounded-2xl p-5"
          >
            <View className="flex-row items-center">

              <View className="w-14 h-14 rounded-2xl bg-white items-center justify-center mr-4">
                <Image
                  source={require('../../../assets/camera.png')}
                  className="w-9 h-9"
                  resizeMode="contain"
                />
              </View>

              <View className="flex-1">
                <Text className="text-white font-semibold text-lg">
                  Start Monitoring
                </Text>

                <Text className="text-slate-300 text-sm mt-1">
                  Use this device as the baby camera
                </Text>
              </View>

              <Text className="text-white text-2xl">
                ›
              </Text>

            </View>
          </TouchableOpacity>

          {/* PARENT MODE */}

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() =>
              navigation.navigate('BabySelect', {
                mode: 'viewer',
              })
            }
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >
            <View className="flex-row items-center">

              <View className="w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center mr-4">
                <Image
                  source={require('../../../assets/View Live Feed.png')}
                  className="w-9 h-9"
                  resizeMode="contain"
                />
              </View>

              <View className="flex-1">
                <Text className="text-slate-900 font-semibold text-lg">
                  Parent Mode
                </Text>

                <Text className="text-slate-500 text-sm mt-1">
                  View your baby's live feed
                </Text>
              </View>

              <Text className="text-slate-500 text-2xl">
                ›
              </Text>

            </View>
          </TouchableOpacity>

        </View>

        {/* ================================================= */}
        {/* RECENT ACTIVITY */}
        {/* ================================================= */}

        <View className="flex-row items-end justify-between mb-4">

          <View className="flex-1 pr-4">
            <Text className="text-xl font-semibold text-slate-900">
              Recent Activity
            </Text>

            <Text className="text-sm text-slate-500 mt-1">
              Latest baby monitor alerts
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Events')}
          >
            <Text className="text-slate-900 font-semibold">
              View All
            </Text>
          </TouchableOpacity>

        </View>

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading ? (
          <Card>
            <View className="items-center py-7">
              <Text className="text-slate-400">
                Loading activity...
              </Text>
            </View>
          </Card>
        ) : recentEvents.length === 0 ? (

          /* ================================================= */
          /* EMPTY STATE */
          /* ================================================= */

          <Card>
            <View className="items-center py-8 px-5">

              <View className="w-16 h-16 rounded-2xl bg-slate-100 items-center justify-center mb-4">
                <Image
                  source={require('../../../assets/Notification Bell.png')}
                  className="w-9 h-9"
                  resizeMode="contain"
                />
              </View>

              <Text className="text-slate-800 font-semibold">
                No alerts yet
              </Text>

              <Text className="text-slate-400 text-xs text-center mt-2 leading-5">
                Motion and cry alerts will appear here.
              </Text>

            </View>
          </Card>

        ) : (

          /* ================================================= */
          /* EVENTS */
          /* ================================================= */

          <View className="gap-3">

            {recentEvents.map((event) => {
              const isMotion = event.type === 'motion';

              return (
                <Card
                  key={event.id}
                  className="flex-row items-center"
                >

                  {/* Event Icon */}

                  <View className="w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center mr-4">

                    <Image
                      source={
                        isMotion
                          ? require('../../../assets/Motion Alerts.png')
                          : require('../../../assets/baby.png')
                      }
                      className="w-8 h-8"
                      resizeMode="contain"
                    />

                  </View>

                  {/* Event Information */}

                  <View className="flex-1">

                    <Text className="font-semibold text-slate-900">
                      {isMotion
                        ? 'Motion Detected'
                        : 'Cry Detected'}
                    </Text>

                    <Text className="text-slate-400 text-xs mt-1">
                      {event.baby_name}
                    </Text>

                    <Text className="text-slate-400 text-xs mt-0.5">
                      {new Date(
                        event.timestamp
                      ).toLocaleString()}
                    </Text>

                  </View>

                  <Text className="text-slate-400 text-2xl">
                    ›
                  </Text>

                </Card>
              );
            })}

          </View>
        )}

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <View className="items-center mt-10">

          <Image
            source={require('../../../assets/babycare-logo.png')}
            className="w-40 h-40"
            resizeMode="contain"
          />

          <Text className="text-slate-400 text-xs mt-1">
            Safe. Connected. Always Watching.
          </Text>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}