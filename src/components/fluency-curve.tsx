import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { categoryColor, categoryLabel, color, font } from '@/constants/theme';
import type { AnalyzeResponse } from '@/lib/api';

type Point = AnalyzeResponse['analysis']['tensionCurve'][number];

/** The web's "fluency curve": ink line, points coloured by category and a dashed guide at 50. */
export function FluencyCurve({ points, width }: { points: Point[]; width: number }) {
  const height = 120;
  const pad = 14;
  if (!points.length) return null;
  const x = (i: number) => (points.length === 1 ? width / 2 : pad + (i * (width - pad * 2)) / (points.length - 1));
  const y = (score: number) => pad + ((100 - score) * (height - pad * 2)) / 100;
  return (
    <View style={{ gap: 10 }}>
      <Svg width={width} height={height} accessibilityLabel="Curva de fluidez de cada cambio">
        <Line x1={pad} x2={width - pad} y1={y(50)} y2={y(50)} stroke={color.hairline} strokeDasharray="4 5" strokeWidth={1.5} />
        <Polyline points={points.map((p, i) => `${x(i)},${y(p.score)}`).join(' ')} fill="none" stroke={color.ink} strokeWidth={2} strokeLinejoin="round" />
        {points.map((p, i) => (
          <Circle key={`${p.from}-${p.to}-${i}`} cx={x(i)} cy={y(p.score)} r={6} fill={categoryColor(p.category)} stroke={color.card} strokeWidth={2} />
        ))}
      </Svg>
      <View style={{ gap: 6 }}>
        {points.map((p, i) => (
          <View key={`row-${i}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ width: 92, color: color.ink, fontFamily: font.monoBold, fontSize: 13 }} numberOfLines={1}>
              {p.from} → {p.to}
            </Text>
            <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: color.paper, overflow: 'hidden' }}>
              <View style={{ width: `${Math.max(4, Math.min(100, p.score))}%`, height: '100%', borderRadius: 4, backgroundColor: categoryColor(p.category) }} />
            </View>
            <Text style={{ width: 64, textAlign: 'right', color: categoryColor(p.category), fontFamily: font.uiBold, fontSize: 12 }}>{categoryLabel(p.category)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
