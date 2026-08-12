export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
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