import React, { useEffect, useRef, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { fromByteArray } from 'base64-js';

const WS_BASE = "wss://clad-atlas-griminess.ngrok-free.dev/ws/monitor";

export default function ViewerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: { babyId: number; babyName: string } }, 'params'>>();
  const { babyId, babyName } = route.params;

  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [frameUri, setFrameUri] = useState<string | null>(null);
  const [lastAlert, setLastAlert] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE}/${babyId}/`);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ role: 'viewer' }));
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (data.alert) {
            setLastAlert(`${data.type === 'motion' ? '🚶 Motion' : '👶 Cry'} detected`);
            setTimeout(() => setLastAlert(null), 4000);
          }
        } catch {}
      } else {
        const bytes = new Uint8Array(event.data as ArrayBuffer);
        const base64 = fromByteArray(bytes);
        setFrameUri(`data:image/jpeg;base64,${base64}`);
      }
    };

    ws.onerror = () => setConnected(false);
    ws.onclose = () => setConnected(false);

    return () => ws.close();
  }, [babyId]);

  return (
    <View className="flex-1 bg-black">
      {frameUri ? (
        <Image source={{ uri: frameUri }} style={{ flex: 1 }} resizeMode="cover" />
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white mt-4">Waiting for live feed...</Text>
        </View>
      )}

      <SafeAreaView className="absolute top-0 left-0 right-0">
        <View className="flex-row items-center justify-between px-5 pt-3">
          <TouchableOpacity
            className="bg-black/50 px-4 py-2 rounded-full"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-white font-medium">✕ Close</Text>
          </TouchableOpacity>
          <View className="bg-black/50 px-4 py-2 rounded-full flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-slate-400'}`} />
            <Text className="text-white font-medium">{connected ? 'Connected' : 'Connecting...'}</Text>
          </View>
        </View>
        <Text className="text-white text-center mt-2 bg-black/40 mx-20 rounded-full py-1">
          Viewing {babyName}
        </Text>
      </SafeAreaView>

      {lastAlert && (
        <View className="absolute bottom-10 left-5 right-5 bg-danger rounded-xl py-3 items-center">
          <Text className="text-white font-semibold">{lastAlert}</Text>
        </View>
      )}
    </View>
  );
}