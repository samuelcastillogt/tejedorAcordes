import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useTabBarInset } from '@/components/ui';
import { color, font, radius } from '@/constants/theme';
import { usePlayback } from '@/lib/audio/playback';
import { useCatalog } from '@/lib/catalog';
import { useProgression } from '@/lib/progression';

export const PLAYER_BAR_HEIGHT = 72;

/** Pinned night bar: play the whole progression, tempo and loop. Follows the web's player. */
export function PlayerBar() {
  const { chords, bpm, loop, update } = useProgression();
  const { notesOf } = useCatalog();
  const { playingId, play, stop, error } = usePlayback();
  const tabBarInset = useTabBarInset();
  const playing = playingId === 'progression';
  const disabled = chords.length === 0;

  const toggle = () => {
    if (playing) stop();
    else void play(chords.map(notesOf), { id: 'progression', bpm, loop });
  };
  const setBpm = (value: number) => {
    update({ bpm: Math.max(50, Math.min(180, value)) });
    if (playing) stop();
  };

  return (
    <View
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: tabBarInset + 10,
        height: PLAYER_BAR_HEIGHT - 10,
        borderRadius: radius.xl,
        borderCurve: 'continuous',
        backgroundColor: color.night,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        gap: 10,
        boxShadow: '0 8px 24px rgba(13, 11, 26, 0.35)',
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playing ? 'Detener' : 'Escuchar la progresión'}
        disabled={disabled}
        onPress={toggle}
        style={({ pressed }) => ({ width: 46, height: 46, borderRadius: 23, backgroundColor: color.gold, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : pressed ? 0.8 : 1 })}
      >
        <Icon name={playing ? 'stop' : 'play'} size={20} color={color.night} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={{ color: color.onNight, fontFamily: font.uiBold, fontSize: 14 }}>{playing ? 'Sonando…' : 'Escuchar'}</Text>
        <Text numberOfLines={1} style={{ color: error ? '#ffb4a8' : color.onNightMute, fontFamily: font.ui, fontSize: 12 }}>
          {error ?? `${chords.length} ${chords.length === 1 ? 'acorde' : 'acordes'}`}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Más lento" hitSlop={6} onPress={() => setBpm(bpm - 8)} style={{ padding: 8 }}>
          <Icon name="minus" size={16} color={color.onNightMute} />
        </Pressable>
        <Text accessibilityLabel={`Tempo ${bpm} pulsos por minuto`} style={{ color: color.onNight, fontFamily: font.monoBold, fontSize: 13, fontVariant: ['tabular-nums'], minWidth: 54, textAlign: 'center' }}>
          {bpm} bpm
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Más rápido" hitSlop={6} onPress={() => setBpm(bpm + 8)} style={{ padding: 8 }}>
          <Icon name="plus" size={16} color={color.onNightMute} />
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel="Repetir"
        accessibilityState={{ checked: loop }}
        onPress={() => {
          update({ loop: !loop });
          if (playing) stop();
        }}
        style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: loop ? 'rgba(242,193,78,0.18)' : 'transparent' }}
      >
        <Icon name="loop" size={18} color={loop ? color.gold : color.onNightMute} />
      </Pressable>
    </View>
  );
}
