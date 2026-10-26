export const parseRgba = (rgbaString: string) => {
  const match = rgbaString.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
  );
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: parseFloat(match[4]),
    };
  }
  return { r: 255, g: 255, b: 255, a: 1 }; // Fallback to opaque white
};
