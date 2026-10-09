import { Text, View } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';

import { color, font } from '@/constants/theme';

/**
 * A chord box. `frets` come from the API's tablature diagrams: high e string first, low E last,
 * "x" muted, "0" open.
 */
export function GuitarDiagram({ frets, size = 170, accent = color.night }: { frets: string[]; size?: number; accent?: string }) {
  const strings = [...frets].reverse(); // low E on the left, as in songbooks
  const numbers = strings.map((value) => (value === 'x' ? null : Number(value)));
  const fretted = numbers.filter((n): n is number => n !== null && n > 0);
  const lowest = fretted.length ? Math.min(...fretted) : 1;
  const base = Math.max(...fretted, 0) > 4 ? lowest : 1;
  const rows = 4;
  const width = size;
  const height = size * 1.15;
  const left = 24;
  const top = 30;
  const gapX = (width - left * 2) / 5;
  const gapY = (height - top - 14) / rows;
  return (
    <View style={{ alignItems: 'center' }} accessibilityLabel={`Diagrama de guitarra: ${strings.join(' ')}`}>
      <Svg width={width} height={height}>
        {base === 1 ? <Rect x={left} y={top - 4} width={gapX * 5} height={5} rx={1.5} fill={color.ink} /> : null}
        {Array.from({ length: rows + 1 }, (_, r) => (
          <Line key={`f${r}`} x1={left} x2={left + gapX * 5} y1={top + r * gapY} y2={top + r * gapY} stroke={color.inkFaint} strokeWidth={1.2} />
        ))}
        {strings.map((_, s) => (
          <Line key={`s${s}`} x1={left + s * gapX} x2={left + s * gapX} y1={top} y2={top + rows * gapY} stroke={color.inkMute} strokeWidth={s < 3 ? 1.6 : 1.1} />
        ))}
        {numbers.map((n, s) => {
          const cx = left + s * gapX;
          if (n === null)
            return (
              <SvgText key={`m${s}`} x={cx} y={top - 12} fontSize={13} fontWeight="700" fill={color.inkMute} textAnchor="middle">
                ×
              </SvgText>
            );
          if (n === 0) return <Circle key={`o${s}`} cx={cx} cy={top - 15} r={5} stroke={color.ink} strokeWidth={1.6} fill="none" />;
          const row = n - base;
          return <Circle key={`d${s}`} cx={cx} cy={top + (row + 0.5) * gapY} r={gapX * 0.36} fill={accent} />;
        })}
        {base > 1 ? (
          <SvgText x={left - 8} y={top + gapY * 0.65} fontSize={12} fill={color.inkMute} textAnchor="end">
            {`${base}`}
          </SvgText>
        ) : null}
      </Svg>
      <Text style={{ color: color.inkMute, fontFamily: font.mono, fontSize: 12 }}>{strings.join(' ')}</Text>
    </View>
  );
}
