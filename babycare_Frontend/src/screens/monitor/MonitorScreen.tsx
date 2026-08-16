import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';

import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

import {
  useAudioRecorder,
  RecordingPresets,
  AudioModule,
} from 'expo-audio';

import * as FileSystem from 'expo-file-system/legacy';

import { toByteArray } from 'base64-js';

import {
  sendLocalAlert,
  requestNotificationPermission,
} from '../../utils/notifications';

const WS_BASE =
  'wss://clad-atlas-griminess.ngrok-free.dev/ws/monitor';

let globalMonitorSocket: WebSocket | null = null;
let globalAudioLoopActive = false;

export default function MonitorScreen() {
  const navigation = useNavigation<any>();

  const route =
    useRoute<
      RouteProp<
        {
          params: {
            babyId: number;
            babyName: string;
          };
        },
        'params'
      >
    >();

  const { babyId, babyName } = route.params;

  const [permission, requestPermission] =
    useCameraPermissions();

  const cameraRef =
    useRef<CameraView>(null);

  const wsRef =
    useRef<WebSocket | null>(null);

  const intervalRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const audioLoopRef =
    useRef<boolean>(false);

  const audioRecorder =
    useAudioRecorder(
      RecordingPresets.HIGH_QUALITY
    );

  const [connected, setConnected] =
    useState(false);

  const [lastAlert, setLastAlert] =
    useState<string | null>(null);

  // =====================================================
  // AUDIO STREAM
  // =====================================================

  const startAudioLoop = async (
    ws: WebSocket
  ) => {
    if (globalAudioLoopActive) {
      return;
    }

    globalAudioLoopActive = true;
    audioLoopRef.current = true;

    const { granted } =
      await AudioModule.requestRecordingPermissionsAsync();

    if (!granted) {
      console.warn(
        'Microphone permission not granted, skipping audio streaming.'
      );

      globalAudioLoopActive = false;
      audioLoopRef.current = false;

      return;
    }

    const recordBurst = async () => {
      if (
        !audioLoopRef.current ||
        ws.readyState !== WebSocket.OPEN
      ) {
        return;
      }

      try {
        await audioRecorder.prepareToRecordAsync();

        audioRecorder.record();

        await new Promise((resolve) =>
          setTimeout(resolve, 2000)
        );

        await audioRecorder.stop();

        const uri = audioRecorder.uri;

        if (uri) {
          const base64 =
            await FileSystem.readAsStringAsync(
              uri,
              {
                encoding:
                  FileSystem.EncodingType.Base64,
              }
            );

          const allBytes =
            toByteArray(base64);

          // Remove WAV header
          const pcmBytes =
            allBytes.slice(44);

          if (
            ws.readyState ===
              WebSocket.OPEN &&
            pcmBytes.length > 0
          ) {
            const payload =
              new Uint8Array(
                pcmBytes.length + 1
              );

            payload[0] = 0x02;

            payload.set(
              pcmBytes,
              1
            );

            ws.send(payload.buffer);
          }
        }
      } catch (err) {
        console.warn(
          'Audio burst failed:',
          err instanceof Error
            ? err.message
            : err
        );
      }

      if (audioLoopRef.current) {
        recordBurst();
      }
    };

    recordBurst();
  };

  // =====================================================
  // MONITOR CONNECTION
  // =====================================================

  useEffect(() => {
    requestNotificationPermission();

    if (!permission?.granted) {
      requestPermission();
      return;
    }

    // Reuse existing socket
    if (
      globalMonitorSocket &&
      globalMonitorSocket.readyState ===
        WebSocket.OPEN
    ) {
      wsRef.current =
        globalMonitorSocket;

      setConnected(true);

      return;
    }

    const ws =
      new WebSocket(
        `${WS_BASE}/${babyId}/`
      );

    wsRef.current = ws;
    globalMonitorSocket = ws;

    // ===================================================
    // SOCKET OPEN
    // ===================================================

    ws.onopen = () => {
  setConnected(true);

  ws.send(
    JSON.stringify({
      role: 'monitor',
    })
  );

  // startAudioLoop(ws); // TEMPORARILY DISABLED FOR TESTING

      startTimeoutRef.current =
        setTimeout(() => {
          intervalRef.current =
            setInterval(
              async () => {
                if (
                  !cameraRef.current ||
                  ws.readyState !==
                    WebSocket.OPEN
                ) {
                  return;
                }

                try {
                  const photo =
                    await cameraRef.current.takePictureAsync(
                      {
                        base64: true,
                        quality: 0.3,
                      }
                    );

                  if (photo?.base64) {
                    const imageBytes =
                      toByteArray(
                        photo.base64
                      );

                    const payload =
                      new Uint8Array(
                        imageBytes.length + 1
                      );

                    payload[0] = 0x01;

                    payload.set(
                      imageBytes,
                      1
                    );

                    ws.send(
                      payload.buffer
                    );
                  }
                } catch (err) {
                  console.warn(
                    'Frame capture skipped:',
                    err instanceof Error
                      ? err.message
                      : err
                  );
                }
              },
              1500
            );
        }, 1000);
    };

    // ===================================================
    // SOCKET MESSAGE
    // ===================================================

    ws.onmessage = (event) => {
      if (
        typeof event.data !==
        'string'
      ) {
        return;
      }

      try {
        const data =
          JSON.parse(event.data);

        if (data.alert) {
          const message =
            data.type === 'motion'
              ? 'Motion detected'
              : 'Cry detected';

          setLastAlert(message);

          setTimeout(() => {
            setLastAlert(null);
          }, 4000);

          sendLocalAlert(
            data.type,
            babyName
          );
        }
      } catch {
        // Ignore invalid messages
      }
    };

    // ===================================================
    // SOCKET ERROR
    // ===================================================

    ws.onerror = (err) => {
      console.error(
        'WebSocket error:',
        err
      );

      setConnected(false);
    };

    // ===================================================
    // SOCKET CLOSE
    // ===================================================

    ws.onclose = (event) => {
      console.warn(
        'WebSocket closed:',
        event.code,
        event.reason
      );

      setConnected(false);

      if (
        globalMonitorSocket === ws
      ) {
        globalMonitorSocket = null;
      }
    };

    // ===================================================
    // EFFECT CLEANUP
    // ===================================================

    return () => {
      if (
        startTimeoutRef.current
      ) {
        clearTimeout(
          startTimeoutRef.current
        );
      }

      if (
        intervalRef.current
      ) {
        clearInterval(
          intervalRef.current
        );
      }

      // Intentionally keep socket/audio
      // alive during React remounts.
    };
  }, [permission?.granted]);

  // =====================================================
  // STOP MONITOR
  // =====================================================

  const handleStop = () => {
    audioLoopRef.current =
      false;

    globalAudioLoopActive =
      false;

    if (intervalRef.current) {
      clearInterval(
        intervalRef.current
      );

      intervalRef.current =
        null;
    }

    if (startTimeoutRef.current) {
      clearTimeout(
        startTimeoutRef.current
      );

      startTimeoutRef.current =
        null;
    }

    if (globalMonitorSocket) {
      globalMonitorSocket.close();

      globalMonitorSocket =
        null;
    }

    wsRef.current = null;

    setConnected(false);

    navigation.goBack();
  };

  // =====================================================
  // PERMISSION LOADING
  // =====================================================

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-black" />
    );
  }

  // =====================================================
  // CAMERA PERMISSION
  // =====================================================

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">

        <View className="w-20 h-20 rounded-2xl bg-slate-100 items-center justify-center mb-6">
          <Text className="text-2xl font-semibold text-slate-700">
            Camera
          </Text>
        </View>

        <Text className="text-xl font-semibold text-slate-900 text-center mb-2">
          Camera Permission Required
        </Text>

        <Text className="text-sm text-slate-500 text-center leading-5 mb-6">
          Camera access is required to use this device as a baby monitor.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          className="bg-slate-900 px-7 py-4 rounded-xl"
          onPress={requestPermission}
        >
          <Text className="text-white font-semibold">
            Grant Permission
          </Text>
        </TouchableOpacity>

      </SafeAreaView>
    );
  }

  // =====================================================
  // MONITOR SCREEN
  // =====================================================

  return (
    <View className="flex-1 bg-black">

      {/* ================================================= */}
      {/* CAMERA */}
      {/* ================================================= */}

      <CameraView
        ref={cameraRef}
        style={{
          flex: 1,
        }}
        facing="back"
        onCameraReady={() =>
          console.log(
            'Camera is ready'
          )
        }
        onMountError={(err) =>
          console.error(
            'Camera mount error:',
            err
          )
        }
      />

      {/* ================================================= */}
      {/* TOP CONTROLS */}
      {/* ================================================= */}

      <SafeAreaView className="absolute top-0 left-0 right-0">

        <View className="px-5 pt-5">

          <View className="flex-row items-center justify-between">

            {/* STOP */}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleStop}
              className="bg-black/60 rounded-xl px-5 py-3.5"
            >
              <Text className="text-white font-semibold">
                Stop
              </Text>
            </TouchableOpacity>

            {/* CONNECTION */}

            <View className="bg-black/60 rounded-xl px-4 py-3 flex-row items-center">

              <View
                className={`w-2.5 h-2.5 rounded-full mr-2 ${
                  connected
                    ? 'bg-green-500'
                    : 'bg-slate-400'
                }`}
              />

              <Text className="text-white text-sm font-semibold">
                {connected
                  ? 'LIVE'
                  : 'Connecting...'}
              </Text>

            </View>

          </View>

          {/* BABY NAME */}

          <View className="self-center bg-black/60 rounded-xl px-5 py-2.5 mt-3">

            <Text className="text-white text-sm font-medium">
              Monitoring {babyName}
            </Text>

          </View>

        </View>

      </SafeAreaView>

      {/* ================================================= */}
      {/* ALERT */}
      {/* ================================================= */}

      {lastAlert && (
        <View className="absolute bottom-10 left-5 right-5">

          <View className="bg-white rounded-2xl px-5 py-4 border border-slate-200">

            <View className="flex-row items-center">

              <View className="w-3 h-3 rounded-full bg-red-500 mr-3" />

              <View className="flex-1">

                <Text className="text-slate-900 font-semibold">
                  Alert
                </Text>

                <Text className="text-slate-600 text-sm mt-1">
                  {lastAlert}
                </Text>

              </View>

            </View>

          </View>

        </View>
      )}

    </View>
  );
}