import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Auditions: undefined;
  Dances: undefined;
  MyList: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Player: { streamUrl: string; title: string; id: string };
  AdminLogin: undefined;
  AdminConfig: undefined;
};
