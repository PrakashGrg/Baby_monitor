import React, { useEffect, useRef, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { toByteArray } from 'base64-js';

const WS_BASE = "wss://clad-atlas-griminess.ngrok-free.dev/ws/monitor";

let globalMonitorSocket: WebSocket | null = null;

export default function MonitorScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: { babyId: number; babyName: string } }, 'params'>>();
  const { babyId, babyName } = route.params;

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioLoopRef = useRef<boolean>(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [connected, setConnected] = useState(false);
  const [lastAlert, setLastAlert] = useState<string | null>(null);

  const startAudioLoop = async (ws: WebSocket) => {
    audioLoopRef.current = true;

    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    if (!granted) {
      console.warn('Microphone permission not granted, skipping audio streaming.');
      return;
    }

    const recordBurst = async () => {
      if (!audioLoopRef.current || ws.readyState !== WebSocket.OPEN) return;

      try {
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        await new Promise((resolve) => setTimeout(resolve, 2000)); // record for 2s
        await audioRecorder.stop();

        const uri = audioRecorder.uri;
        if (uri) {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const allBytes = toByteArray(base64);
          // Strip the ~44 byte WAV header to get raw PCM data
          const pcmBytes = allBytes.slice(44);

          if (ws.readyState === WebSocket.OPEN && pcmBytes.length > 0) {
            const payload = new Uint8Array(pcmBytes.length + 1);
            payload[0] = 0x02;
            payload.set(pcmBytes, 1);
            ws.send(payload.buffer);
          }
        }
      } catch (err) {
        console.warn('Audio burst failed:', err instanceof Error ? err.message : err);
      }

      if (audioLoopRef.current) {
        recordBurst(); // loop to next burst
      }
    };

    recordBurst();
  };

  useEffect(() => {
    console.log('🔵 Monitor effect running, granted:', permission?.granted);

    if (!permission?.granted) {
      requestPermission();
      return;
    }

    if (globalMonitorSocket && globalMonitorSocket.readyState === WebSocket.OPEN) {
      wsRef.current = globalMonitorSocket;
      setConnected(true);
      return;
    }

    const ws = new WebSocket(`${WS_BASE}/${babyId}/`);
    wsRef.current = ws;
    globalMonitorSocket = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ role: 'monitor' }));
      startAudioLoop(ws);

      startTimeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(async () => {
          if (!cameraRef.current || ws.readyState !== WebSocket.OPEN) return;
          try {
            const photo = await cameraRef.current.takePictureAsync({
              base64: true,
              quality: 0.3,
            });
            if (photo?.base64) {
              const imageBytes = toByteArray(photo.base64);
              const payload = new Uint8Array(imageBytes.length + 1);
              payload[0] = 0x01;
              payload.set(imageBytes, 1);
              ws.send(payload.buffer);
            }
          } catch (err) {
            console.warn('Frame capture skipped:', err instanceof Error ? err.message : err);
          }
        }, 1500);
      }, 1000);
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
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setConnected(false);
    };
    ws.onclose = (event) => {
      console.warn('WebSocket closed:', event.code, event.reason);
      setConnected(false);
      if (globalMonitorSocket === ws) {
        globalMonitorSocket = null;
      }
    };

    return () => {
      console.log('🔴 Monitor effect CLEANUP running (socket left open intentionally)');
      audioLoopRef.current = false;
      if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Intentionally NOT closing the socket here — React dev-mode double-invokes
      // this effect, which would kill a socket we just opened. Real cleanup
      // happens via the Stop button and handleStop() below.
    };
  }, [permission?.granted]);

  const handleStop = () => {
    audioLoopRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    if (globalMonitorSocket) {
      globalMonitorSocket.close();
      globalMonitorSocket = null;
    }
    navigation.goBack();
  };

  if (!permission) return <SafeAreaView className="flex-1 bg-black" />;

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <Text className="text-slate-700 text-center mb-4">
          Camera permission is required to start monitoring.
        </Text>
        <TouchableOpacity className="bg-primary-600 px-6 py-3 rounded-xl" onPress={requestPermission}>
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        onCameraReady={() => console.log('📸 Camera is ready')}
        onMountError={(err) => console.error('📸 Camera mount error:', err)}
      />

      <SafeAreaView className="absolute top-0 left-0 right-0">
        <View className="flex-row items-center justify-between px-5 pt-3">
          <TouchableOpacity className="bg-black/50 px-4 py-2 rounded-full" onPress={handleStop}>
            <Text className="text-white font-medium">✕ Stop</Text>
          </TouchableOpacity>
          <View className="bg-black/50 px-4 py-2 rounded-full flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-red-500' : 'bg-slate-400'}`} />
            <Text className="text-white font-medium">{connected ? 'LIVE' : 'Connecting...'}</Text>
          </View>
        </View>
        <Text className="text-white text-center mt-2 bg-black/40 mx-20 rounded-full py-1">
          Monitoring {babyName}
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