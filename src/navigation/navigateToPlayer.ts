import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export function navigateToPlayer(
  navigation: NavigationProp<Record<string, object | undefined>>,
  params: RootStackParamList['Player']
): void {
  const parent = navigation.getParent() as
    | NavigationProp<RootStackParamList>
    | undefined;
  if (parent) {
    parent.navigate('Player', params);
    return;
  }
  (navigation as unknown as NavigationProp<RootStackParamList>).navigate(
    'Player',
    params
  );
}
