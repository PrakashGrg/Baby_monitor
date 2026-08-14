import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function sendLocalAlert(type: 'motion' | 'cry', babyName: string) {
  const title = type === 'motion' ? '🚶 Motion Detected' : '👶 Cry Detected';
  const body = `${babyName} — check the live feed now`;

  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null, // fire immediately
  });
}