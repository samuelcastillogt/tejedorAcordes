import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { color } from '@/constants/theme';

/** Four tabs: analyse what you play, explore what comes next, look up chords, your library. */
export default function TabsLayout() {
  return (
    <NativeTabs
      backgroundColor={color.card}
      tintColor={color.night}
      iconColor={{ default: color.inkFaint, selected: color.night }}
      indicatorColor="rgba(242, 193, 78, 0.35)"
      labelStyle={{ default: { color: color.inkMute }, selected: { color: color.night } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'waveform', selected: 'waveform' }} md="graphic_eq" />
        <NativeTabs.Trigger.Label>Analizar</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explorar">
        <NativeTabs.Trigger.Icon sf={{ default: 'point.3.connected.trianglepath.dotted', selected: 'point.3.filled.connected.trianglepath.dotted' }} md="explore" />
        <NativeTabs.Trigger.Label>Explorar</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="acordes">
        <NativeTabs.Trigger.Icon sf={{ default: 'guitars', selected: 'guitars.fill' }} md="music_note" />
        <NativeTabs.Trigger.Label>Acordes</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="biblioteca">
        <NativeTabs.Trigger.Icon sf={{ default: 'books.vertical', selected: 'books.vertical.fill' }} md="library_music" />
        <NativeTabs.Trigger.Label>Biblioteca</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
