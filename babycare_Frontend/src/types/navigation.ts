export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type RootAppStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  BabySelect: { mode: 'monitor' | 'viewer' };
  Monitor: { babyId: number; babyName: string };
  Viewer: { babyId: number; babyName: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Babies: undefined;
  Events: undefined;
  Settings: undefined;
};

export type BabiesStackParamList = {
  BabyList: undefined;
  BabyAdd: undefined;
  BabyEdit: { babyId: number };
};

export type EventsStackParamList = {
  EventList: undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};