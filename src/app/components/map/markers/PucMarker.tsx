import { memo } from "react";

interface PucMarkerProps {
  speciesCount: number;
  baseColor: string; // Hex color like '#RRGGBB'
  upper: number; // Max possible species count
  opacity?: number;
}

// Helper function to convert RGB (0-255) to HSL (H: 0-360, S/L: 0-100)
// This is necessary to manipulate lightness directly.
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100]; // HSL values
};

function PucMarker({
  speciesCount,
  baseColor,
  opacity = 1,
  upper,
}: PucMarkerProps) {
  const getColorWithLightness = ({
    speciesCount,
    baseColor,
    upper,
  }: PucMarkerProps) => {
    if (speciesCount <= 0) {
      return "transparent";
    }

    // 1. Calculate the intensity ratio (0.0 for low count/black, 1.0 for high count/bright)
    const ratio = Math.min(speciesCount / upper, 1);

    // 2. Convert Hex to RGB
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    // 3. Convert RGB to HSL
    const [h, s, l_original] = rgbToHsl(r, g, b);

    // 4. Map the ratio to the Lightness range (L)
    // We want the color to go from 0% Lightness (black) to its original Lightness (l_original).
    // The Lightness will be at least 15% to avoid pure black, and scaled up to the original L value.

    // Scale the ratio from a starting lightness (e.g., 15%) up to the original lightness.
    const MIN_LIGHTNESS = 15; // Set a floor to ensure visibility
    const finalLightness = MIN_LIGHTNESS + (l_original - MIN_LIGHTNESS) * ratio;

    // 5. Return the color in HSL format
    const colorString = `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(
      finalLightness
    )}%)`;
    return colorString;
  };

  return (
    <svg
      width="40"
      height="40"
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      x="0px"
      y="0px"
      viewBox="0 0 100 100"
      enableBackground="new 0 0 100 100"
      style={{ cursor: "pointer" }}
    >
      {/* <circle cx="50" cy="50" r="50" fill="white" /> */}
      <path
        stroke="black"
        strokeWidth={5}
        strokeOpacity={opacity}
        opacity={opacity}
        fill={getColorWithLightness({
          speciesCount,
          baseColor,
          upper,
          opacity,
        })} // Call the new function
        d="M41.284,16.77c-6.892-8.522-22.535-8.018-31.278,3.399c-1.577,2.059-2.811,4.729-3.743,7.761l-5.836,2.436l4.57,2.841  c-2.102,11.536-0.88,25.768,2.064,32.698c9.018,21.227,38.185,27.266,55.113,20.588c24.564-9.692,37.398-29.309,37.398-29.309  S70.898,56.879,41.284,16.77z M21.102,26.478c-0.336,1.649-2.192,2.682-4.146,2.305c-1.954-0.376-3.266-2.019-2.93-3.668  c0.335-1.649,2.192-2.682,4.146-2.306C20.126,23.186,21.437,24.828,21.102,26.478z M78.92,65.088  c-2.406,6.359-13.541,8.04-24.867,3.754C42.726,64.556,35.494,55.926,37.9,49.565c2.406-6.36,13.54-8.041,24.868-3.754  C74.094,50.097,81.326,58.728,78.92,65.088z"
      ></path>
    </svg>
  );
}
export default memo(PucMarker);
