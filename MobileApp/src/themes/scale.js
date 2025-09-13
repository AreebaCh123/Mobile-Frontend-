// src/theme/scale.js
import { Dimensions, PixelRatio } from 'react-native';
const { width } = Dimensions.get('window');

const BASE_WIDTH = 390; // your Figma design width

export const ms = (size) => {
  const next = (width / BASE_WIDTH) * size;
  return Math.round(PixelRatio.roundToNearestPixel(next));
};
