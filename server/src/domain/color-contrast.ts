function channel(value: number) {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string) {
  const value = hex.replace('#', '');
  if (!/^[a-f\d]{6}$/i.test(value)) return Number.NaN;
  const [red, green, blue] = [0, 2, 4].map((offset) => channel(Number.parseInt(value.slice(offset, offset + 2), 16)));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(left: string, right: string) {
  const leftLum = relativeLuminance(left);
  const rightLum = relativeLuminance(right);
  if (Number.isNaN(leftLum) || Number.isNaN(rightLum)) return 0;
  return (Math.max(leftLum, rightLum) + 0.05) / (Math.min(leftLum, rightLum) + 0.05);
}
