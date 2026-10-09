import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, PressableProps, ScrollView, ScrollViewProps, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconName } from '@/components/icon';
import { color, font, radius, shadow } from '@/constants/theme';

/**
 * Space taken by the native tab bar at the bottom of a tab screen. On iOS the content runs under
 * the (glass) tab bar; on Android the Material bar sits below the content.
 */
export function useTabBarInset() {
  const insets = useSafeAreaInsets();
  return process.env.EXPO_OS === 'ios' ? insets.bottom + 56 : 0;
}

/** Paper page with the night header on top; extra bottom space leaves room for a pinned bar. */
export function Screen({ children, bottomSpace = 32, ...props }: ScrollViewProps & { bottomSpace?: number }) {
  const tabBarInset = useTabBarInset();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.paper }}
      contentContainerStyle={{ gap: 16, paddingBottom: bottomSpace + tabBarInset }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      // The night header already pads for the status bar.
      contentInsetAdjustmentBehavior="never"
      {...props}
    >
      {children}
    </ScrollView>
  );
}

/** The website's "night" band: where the brand lives and where you play and listen. */
export function NightHeader({ eyebrow, title, subtitle, right, children }: { eyebrow: string; title: string; subtitle?: string; right?: ReactNode; children?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor: color.night, paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: 22, gap: 10, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl, borderCurve: 'continuous' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 }}>
        <Text style={{ color: color.gold, fontFamily: font.uiBold, fontSize: 12, letterSpacing: 2.4, textTransform: 'uppercase' }}>{eyebrow}</Text>
        {right}
      </View>
      <Text accessibilityRole="header" style={{ color: color.onNight, fontFamily: font.display, fontSize: 34, lineHeight: 38 }}>
        {title}
      </Text>
      {subtitle ? <Text style={{ color: color.onNightMute, fontFamily: font.ui, fontSize: 15, lineHeight: 22 }}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ backgroundColor: color.card, borderColor: color.hairline, borderWidth: 1, borderRadius: radius.lg, borderCurve: 'continuous', padding: 16, gap: 12, marginHorizontal: 16, boxShadow: shadow.card }, style]}>
      {children}
    </View>
  );
}

export function Label({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ color: color.inkMute, fontFamily: font.uiBold, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }, style]}>{children}</Text>;
}

export function Title({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ color: color.ink, fontFamily: font.display, fontSize: 24, lineHeight: 29 }, style]}>{children}</Text>;
}

export function Body({ children, style, selectable }: { children: ReactNode; style?: StyleProp<TextStyle>; selectable?: boolean }) {
  return (
    <Text selectable={selectable} style={[{ color: color.inkMute, fontFamily: font.ui, fontSize: 15, lineHeight: 22 }, style]}>
      {children}
    </Text>
  );
}

type Variant = 'night' | 'gold' | 'teal' | 'outline' | 'ghost' | 'danger' | 'outlineNight';

const VARIANTS: Record<Variant, { bg: string; fg: string; border?: string }> = {
  night: { bg: color.night, fg: color.onNight },
  gold: { bg: color.gold, fg: color.night },
  teal: { bg: color.tealDeep, fg: color.onNight },
  outline: { bg: 'transparent', fg: color.ink, border: color.hairline },
  outlineNight: { bg: 'transparent', fg: color.onNight, border: color.hairlineNight },
  ghost: { bg: 'transparent', fg: color.night },
  danger: { bg: 'transparent', fg: color.danger, border: color.danger },
};

export function Button({
  label,
  onPress,
  variant = 'night',
  icon,
  loading,
  disabled,
  pill,
  style,
  accessibilityLabel,
}: {
  label: string;
  onPress?: PressableProps['onPress'];
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  pill?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          minHeight: 48,
          paddingHorizontal: 18,
          borderRadius: pill ? 999 : radius.md,
          borderCurve: 'continuous',
          backgroundColor: v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={v.fg} /> : icon ? <Icon name={icon} size={18} color={v.fg} /> : null}
      <Text style={{ color: v.fg, fontFamily: font.uiBold, fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({ icon, onPress, label, tone = 'night', size = 40 }: { icon: IconName; onPress?: () => void; label: string; tone?: 'night' | 'paper' | 'gold'; size?: number }) {
  const bg = tone === 'gold' ? color.gold : tone === 'night' ? 'rgba(255,255,255,0.08)' : color.card;
  const fg = tone === 'gold' ? color.night : tone === 'night' ? color.onNight : color.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        borderWidth: tone === 'paper' ? 1 : 0,
        borderColor: color.hairline,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Icon name={icon} size={size * 0.45} color={fg} />
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, mono, tone = 'paper', accessibilityLabel }: { label: string; selected?: boolean; onPress?: () => void; mono?: boolean; tone?: 'paper' | 'night'; accessibilityLabel?: string }) {
  const night = tone === 'night';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 40,
        minWidth: 44,
        paddingHorizontal: 14,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: selected ? (night ? color.gold : color.night) : night ? color.hairlineNight : color.hairline,
        backgroundColor: selected ? (night ? color.gold : color.night) : night ? 'transparent' : color.card,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text style={{ color: selected ? (night ? color.night : color.onNight) : night ? color.onNight : color.ink, fontFamily: mono ? font.monoBold : font.uiMedium, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

/** Two-option switch ("Cifrado | Grados"). */
export function Segmented<T extends string>({ options, value, onChange, tone = 'paper' }: { options: { id: T; label: string }[]; value: T; onChange: (id: T) => void; tone?: 'paper' | 'night' }) {
  const night = tone === 'night';
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: night ? 'rgba(255,255,255,0.08)' : color.paper, borderWidth: night ? 0 : 1, borderColor: color.hairline }}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id)}
            style={{ minHeight: 34, paddingHorizontal: 14, borderRadius: 999, justifyContent: 'center', backgroundColor: selected ? (night ? color.gold : color.night) : 'transparent' }}
          >
            <Text style={{ fontFamily: font.uiBold, fontSize: 13, color: selected ? (night ? color.night : color.onNight) : night ? color.onNightMute : color.inkMute }}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card style={{ borderColor: '#f2c8c3', backgroundColor: '#fff6f4' }}>
      <Text selectable style={{ color: color.danger, fontFamily: font.uiMedium, fontSize: 14, lineHeight: 20 }}>
        {message}
      </Text>
      {onRetry ? <Button label="Reintentar" variant="danger" onPress={onRetry} /> : null}
    </Card>
  );
}
