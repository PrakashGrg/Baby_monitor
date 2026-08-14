import React, { useCallback, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getSystemLogs, SystemLog } from '../../api/systemLogs';
import Card from '../../components/Card';

const LEVEL_STYLES: Record<SystemLog['level'], { bg: string; text: string; icon: string }> = {
  INFO: { bg: 'bg-primary-100', text: 'text-primary-700', icon: 'ℹ️' },
  WARNING: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⚠️' },
  ERROR: { bg: 'bg-red-100', text: 'text-red-700', icon: '⛔' },
};

export default function SystemLogsScreen() {
  const navigation = useNavigation<any>();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      const data = await getSystemLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load system logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [loadLogs])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-slate-900">
      <View className="px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
          <Text className="text-primary-600 text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-slate-900 dark:text-white">System Logs</Text>
        <Text className="text-slate-500 mt-1">Operational activity and diagnostics</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-400">Loading...</Text>
        </View>
      ) : logs.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">🗒️</Text>
          <Text className="text-lg font-semibold text-slate-700 mb-1">No logs yet</Text>
          <Text className="text-slate-400 text-center">
            System activity will appear here once monitoring starts
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const style = LEVEL_STYLES[item.level];
            return (
              <Card className="flex-row items-center">
                <View className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${style.bg}`}>
                  <Text className="text-sm">{style.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 dark:text-white font-medium">{item.message}</Text>
                  <Text className="text-slate-400 text-xs mt-0.5">
                    {item.baby_name ? `${item.baby_name} • ` : ''}
                    {formatTime(item.timestamp)}
                  </Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${style.bg}`}>
                  <Text className={`text-xs font-semibold ${style.text}`}>{item.level}</Text>
                </View>
              </Card>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}