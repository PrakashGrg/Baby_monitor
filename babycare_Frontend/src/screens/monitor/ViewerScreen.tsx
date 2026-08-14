import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';

import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';

import { fromByteArray } from 'base64-js';

import {
  sendLocalAlert,
  requestNotificationPermission,
} from '../../utils/notifications';

const WS_BASE =
  'wss://clad-atlas-griminess.ngrok-free.dev/ws/monitor';

export default function ViewerScreen() {
  const navigation = useNavigation<any>();

  const route = useRoute<
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

  // -----------------------------------------
  // State
  // -----------------------------------------

  const wsRef = useRef<WebSocket | null>(null);

  const [connected, setConnected] =
    useState(false);

  const [frameUri, setFrameUri] =
    useState<string | null>(null);

  const [lastAlert, setLastAlert] =
    useState<string | null>(null);

  // -----------------------------------------
  // WebSocket
  // -----------------------------------------

  useEffect(() => {
    requestNotificationPermission();

    console.log(
      '🟢 Starting viewer for:',
      babyName,
      babyId
    );

    const ws = new WebSocket(
      `${WS_BASE}/${babyId}/`
    );

    ws.binaryType = 'arraybuffer';

    wsRef.current = ws;

    // ---------------------------------------
    // Connected
    // ---------------------------------------

    ws.onopen = () => {
      console.log('🟢 Viewer connected');

      setConnected(true);

      ws.send(
        JSON.stringify({
          role: 'viewer',
        })
      );
    };

    // ---------------------------------------
    // Messages
    // ---------------------------------------

    ws.onmessage = (event) => {

      // -------------------------------------
      // Alert message
      // -------------------------------------

      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);

          if (data.alert) {

            const alertText =
              data.type === 'motion'
                ? '🚶 Motion detected'
                : '👶 Cry detected';

            setLastAlert(alertText);

            setTimeout(() => {
              setLastAlert(null);
            }, 4000);

            sendLocalAlert(
              data.type,
              babyName
            );
          }

        } catch (error) {
          console.warn(
            'Invalid WebSocket message:',
            error
          );
        }

        return;
      }

      // -------------------------------------
      // Video frame
      // -------------------------------------

      try {
        const bytes = new Uint8Array(
          event.data as ArrayBuffer
        );

        const base64 =
          fromByteArray(bytes);

        setFrameUri(
          `data:image/jpeg;base64,${base64}`
        );

      } catch (error) {
        console.warn(
          'Could not decode video frame:',
          error
        );
      }
    };

    // ---------------------------------------
    // WebSocket error
    // ---------------------------------------

    ws.onerror = (error) => {
      console.error(
        'Viewer WebSocket error:',
        error
      );

      setConnected(false);
    };

    // ---------------------------------------
    // WebSocket closed
    // ---------------------------------------

    ws.onclose = () => {
      console.log(
        '🔴 Viewer disconnected'
      );

      setConnected(false);
    };

    // ---------------------------------------
    // Cleanup
    // ---------------------------------------

    return () => {
      console.log(
        '🔴 Closing viewer WebSocket'
      );

      ws.close();

      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };

  }, [babyId, babyName]);

  // -----------------------------------------
  // Go Back
  // -----------------------------------------

  const handleBack = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    navigation.goBack();
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <View className="flex-1 bg-black">

      {/* ===================================== */}
      {/* LIVE VIDEO */}
      {/* ===================================== */}

      {frameUri ? (

        <Image
          source={{
            uri: frameUri,
          }}
          style={{
            flex: 1,
          }}
          resizeMode="cover"
        />

      ) : (

        <View className="flex-1 items-center justify-center bg-black">

          <View className="w-20 h-20 rounded-full bg-white/10 items-center justify-center mb-5">

            <Text className="text-4xl">
              📹
            </Text>

          </View>

          <ActivityIndicator
            size="large"
            color="#ffffff"
          />

          <Text className="text-white mt-4 text-base font-medium">
            Waiting for live feed...
          </Text>

          <Text className="text-white/50 text-xs mt-2">
            Connecting to {babyName}
          </Text>

        </View>

      )}


      {/* ===================================== */}
      {/* TOP CONTROLS */}
      {/* ===================================== */}

      <SafeAreaView
        className="absolute top-0 left-0 right-0"
        pointerEvents="box-none"
      >

        {/* Extra top spacing so Android status bar
            does not cover the buttons */}

        <View className="px-5 pt-5">

          {/* ================================= */}
          {/* TOP ROW */}
          {/* ================================= */}

          <View className="flex-row items-center justify-between">

            {/* --------------------------------- */}
            {/* BACK BUTTON */}
            {/* --------------------------------- */}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBack}
              className="bg-black/70 px-5 py-3 rounded-full"
            >

              <Text className="text-white font-bold text-base">
                ← Back
              </Text>

            </TouchableOpacity>


            {/* --------------------------------- */}
            {/* CONNECTION STATUS */}
            {/* --------------------------------- */}

            <View className="bg-black/70 px-4 py-3 rounded-full flex-row items-center">

              <View
                className={`w-2.5 h-2.5 rounded-full mr-2 ${
                  connected
                    ? 'bg-green-500'
                    : 'bg-slate-400'
                }`}
              />

              <Text className="text-white font-semibold text-sm">
                {connected
                  ? 'LIVE'
                  : 'Connecting...'}
              </Text>

            </View>

          </View>


          {/* ================================= */}
          {/* BABY NAME */}
          {/* ================================= */}

          <View className="self-center mt-3 bg-black/70 px-5 py-2 rounded-full">

            <Text className="text-white text-sm font-semibold">
              Viewing {babyName}
            </Text>

          </View>

        </View>

      </SafeAreaView>


      {/* ===================================== */}
      {/* LIVE MONITOR INDICATOR */}
      {/* ===================================== */}

      {connected && frameUri && (

        <View className="absolute left-5 bottom-6">

          <View className="bg-black/70 px-4 py-2 rounded-full flex-row items-center">

            <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />

            <Text className="text-white text-xs font-semibold">
              LIVE MONITOR
            </Text>

          </View>

        </View>

      )}


      {/* ===================================== */}
      {/* ALERT */}
      {/* ===================================== */}

      {lastAlert && (

        <View className="absolute bottom-6 left-5 right-5">

          <View className="bg-red-600 rounded-2xl px-5 py-4 flex-row items-center shadow-lg">

            {/* Alert Icon */}

            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">

              <Text className="text-xl">
                ⚠️
              </Text>

            </View>


            {/* Alert Text */}

            <View className="flex-1">

              <Text className="text-white font-bold text-base">
                Baby Alert
              </Text>

              <Text className="text-red-100 text-sm mt-0.5">
                {lastAlert}
              </Text>

            </View>

          </View>

        </View>

      )}

    </View>
  );
}