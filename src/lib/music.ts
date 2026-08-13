export function categoryLabel(category: string) {
  if (category === 'natural') return 'Natural';
  if (category === 'media') return 'Media';
  if (category === 'tensa') return 'Tensa';
  return 'Extrema';
}

export function categoryColor(category: string) {
  if (category === 'natural') return '#22c55e';
  if (category === 'media') return '#eab308';
  if (category === 'tensa') return '#f97316';
  return '#ef4444';
}

export function chordFamilyColor(type: string) {
  if (type === 'major') return '#f472b6';
  if (type === 'minor') return '#38bdf8';
  if (type === 'dim' || type === 'dim7') return '#8b5cf6';
  if (type === 'dom7') return '#facc15';
  if (type === 'aug') return '#22c55e';
  return '#c9b4fa';
}
