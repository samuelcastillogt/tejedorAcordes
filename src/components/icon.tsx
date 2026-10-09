import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName = 'play' | 'stop' | 'plus' | 'close' | 'share' | 'loop' | 'user' | 'chevron-right' | 'chevron-left' | 'minus' | 'trash' | 'save' | 'sparkle';

/** Small stroke icons drawn with SVG so they look the same on Android, iOS and the web. */
export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const stroke = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'play' && <Path d="M7 5.5v13l11-6.5z" fill={color} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />}
      {name === 'stop' && <Rect x={6.5} y={6.5} width={11} height={11} rx={2} fill={color} />}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...stroke} />}
      {name === 'minus' && <Path d="M5 12h14" {...stroke} />}
      {name === 'close' && <Path d="M6 6l12 12M18 6L6 18" {...stroke} />}
      {name === 'share' && <Path d="M12 15V4m0 0L8 8m4-4l4 4M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5" {...stroke} />}
      {name === 'loop' && <Path d="M17 2l3 3-3 3M4 11V9a4 4 0 014-4h12M7 22l-3-3 3-3m13-3v2a4 4 0 01-4 4H4" {...stroke} />}
      {name === 'user' && (
        <>
          <Circle cx={12} cy={8} r={4} {...stroke} />
          <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" {...stroke} />
        </>
      )}
      {name === 'chevron-right' && <Path d="M9 5l7 7-7 7" {...stroke} />}
      {name === 'chevron-left' && <Path d="M15 5l-7 7 7 7" {...stroke} />}
      {name === 'trash' && <Path d="M4 7h16M9 7V4h6v3m-8 0l1 13h8l1-13" {...stroke} />}
      {name === 'save' && <Path d="M6 3h10l4 4v14H4V3h2zm2 0v6h8V3M8 21v-7h8v7" {...stroke} />}
      {name === 'sparkle' && <Path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" {...stroke} />}
    </Svg>
  );
}
