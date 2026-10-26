import {
  atomDark,
  materialDark,
  materialLight,
  prism,
  twilight,
  dracula,
  solarizedlight,
  duotoneForest,
  coldarkDark,
  a11yDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";

export const PREDEFINED_IMAGES = [
  {
    id: "img1",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926",
    label: "Abstract Blue",
  },
  {
    id: "img2",
    url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85",
    label: "Purple Haze",
  },
  {
    id: "img3",
    url: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5",
    label: "Neon Glow",
  },
  {
    id: "img4",
    url: "https://images.unsplash.com/photo-1557682260-96773eb01377",
    label: "Dark Waves",
  },
  {
    id: "img5",
    url: "https://images.unsplash.com/photo-1557682268-9b00e19d9a0b",
    label: "Soft Gradient",
  },
  {
    id: "img6",
    url: "https://images.unsplash.com/photo-1557682257-2f9c5810fd99",
    label: "Cosmic Dust",
  },
  {
    id: "img7",
    url: "https://images.unsplash.com/photo-1557682282-9e19f4c3e4b9",
    label: "Aurora",
  },
  {
    id: "img8",
    url: "https://images.unsplash.com/photo-1557682293-6b9a23677597",
    label: "Blurry Lights",
  },
  {
    id: "img9",
    url: "https://images.unsplash.com/photo-1557682302-9f1b1b8f8c9f",
    label: "Ocean Breeze",
  },
  {
    id: "img10",
    url: "https://images.unsplash.com/photo-1557682317-7c9b8c8f8c9f",
    label: "Night Sky",
  },
  {
    id: "img11",
    url: "https://images.unsplash.com/photo-1557682324-9c9b8c8f8c9f",
    label: "Fire Glow",
  },
  {
    id: "img12",
    url: "https://images.unsplash.com/photo-1557682335-9c9b8c8f8c9f",
    label: "Minimal Wave",
  },
  {
    id: "img13",
    url: "https://images.unsplash.com/photo-1557682346-9c9b8c8f8c9f",
    label: "Pastel Dream",
  },
  {
    id: "img14",
    url: "https://images.unsplash.com/photo-1557682357-9c9b8c8f8c9f",
    label: "Vivid Abstract",
  },
  {
    id: "img15",
    url: "https://images.unsplash.com/photo-1557682368-9c9b8c8f8c9f",
    label: "Twilight",
  },
];

export const PREDEFINED_GRADIENTS: { label: string; gradient: string }[] = [
  {
    label: "Crimson Twilight",
    gradient:
      "linear-gradient( 109.6deg,  rgba(204,0,0,1) 11.2%, rgba(68,0,0,1) 100.6% )",
  },
  {
    label: "Golden Rose",
    gradient:
      "linear-gradient( 177.5deg,  rgba(255,200,42,1) 28.3%, rgba(202,32,132,1) 79.8% )",
  },
  {
    label: "Golden Oasis",
    gradient:
      "radial-gradient( circle 297px at 8% 45%,  rgba(245,234,176,1) 0%, rgba(133,239,212,1) 100.7% )",
  },
  {
    label: "Aqua Horizon",
    gradient:
      "radial-gradient( circle farthest-corner at 10% 20%,  rgba(56,207,191,1) 0%, rgba(10,70,147,1) 90.2% )",
  },
  {
    label: "Emerald Nightfall",
    gradient:
      "radial-gradient( circle farthest-corner at 96.1% 7.2%,  rgba(9,178,62,1) 0%, rgba(19,19,19,1) 100.2% )",
  },
  {
    label: "Blush Blossom",
    gradient:
      "radial-gradient( circle farthest-corner at 10% 20%,  rgba(240, 139, 139, 1) 0%, rgba(243, 252, 166, 1) 90% )",
  },
  {
    label: "Lavender Dream",
    gradient:
      "radial-gradient( circle 341px at 10% 20%,  rgba(132, 94, 194, 1) 0%, rgba(196, 243, 251, 1) 90% )",
  },
  {
    label: "Sunrise Serenade",
    gradient:
      "linear-gradient(91.7deg, rgba(135, 206, 235, 1) 7.3%, rgba(255, 154, 139, 1) 40.3%, rgba(255, 195, 160, 1) 57.9%, rgba(255, 215, 0, 1) 93.5%)",
  },
  {
    label: "Iridescent Waves",
    gradient:
      "linear-gradient(109.6deg, rgba(112, 246, 255, 0.33) 11.2%, rgba(221, 108, 241, 0.26) 42%, rgba(229, 106, 253, 0.71) 71.5%, rgba(123, 183, 253, 1) 100.2%)",
  },
  {
    label: "Prismatic Bloom",
    gradient:
      "linear-gradient(68.1deg, rgba(196, 69, 69, 1) 9.2%, rgba(255, 167, 73, 0.82) 25%, rgba(253, 217, 82, 0.82) 43.4%, rgba(107, 225, 108, 0.82) 58.2%, rgba(107, 169, 225, 0.82) 75.1%, rgba(153, 41, 243, 0.82) 87.3%)",
  },
  {
    label: "Peach Bliss",
    gradient:
      "linear-gradient(64.3deg, rgba(254, 122, 152, 0.81) 17.7%, rgba(255, 206, 134, 1) 64.7%, rgba(172, 253, 163, 0.64) 112.1%)",
  },
  {
    label: "Amber Glow",
    gradient:
      "linear-gradient(107.7deg, rgba(235, 230, 44, 0.55) 8.4%, rgba(252, 152, 15, 1) 90.3%)",
  },
  {
    label: "Ocean's Embrace",
    gradient:
      "radial-gradient(circle farthest-corner at 48.4% 47.5%, rgba(122, 183, 255, 1) 0%, rgba(21, 83, 161, 1) 90%)",
  },
  {
    label: "Celestial Spectrum",
    gradient:
      "linear-gradient(226.4deg, rgba(255, 26, 1, 1) 28.9%, rgba(254, 155, 1, 1) 33%, rgba(255, 241, 0, 1) 48.6%, rgba(34, 218, 1, 1) 65.3%, rgba(0, 141, 254, 1) 80.6%, rgba(113, 63, 254, 1) 100.1%)",
  },
  {
    label: "Silver Lining",
    gradient:
      "linear-gradient(180.3deg, rgba(221, 221, 221, 1) 5.5%, rgba(110, 136, 161, 1) 90.2%)",
  },
  {
    label: "Golden Sunset",
    gradient:
      "linear-gradient(109.6deg, rgba(255,253,208,1) 11.2%, rgba(153,102,51,1) 91%)",
  },
  {
    label: "Blackened Night",
    gradient:
      "linear-gradient(0.1deg, rgba(21, 13, 15, 1) 10.2%, rgba(21, 13, 15, 0.70) 99.8%, rgba(21, 13, 15, 0.29) 121.2%)",
  },
  {
    label: "Sunset Overdrive",
    gradient:
      "linear-gradient(97.3deg, rgba(25, 50, 70, 0.81) 10.7%, rgba(155, 65, 25, 0.72) 39.5%, rgba(255, 192, 0, 0.81) 69.7%)",
  },
  {
    label: "Red Sunset",
    gradient:
      "radial-gradient(circle farthest-corner at 10% 20%, rgba(235, 131, 130, 1) 0%, rgba(235, 131, 130, 0.75) 38.6%, rgba(211, 177, 125, 0.52) 72.1%, rgba(211, 177, 125, 0.24) 94.7%)",
  },
  {
    label: "Blue Horizon",
    gradient:
      "radial-gradient(circle 1224px at 10.6% 8.8%, rgba(255, 255, 255, 1) 0%, rgba(153, 202, 251, 1) 100.2%)",
  },
  {
    label: "Green Mist",
    gradient:
      "linear-gradient(113.7deg, rgba(90, 173, 173, 1) 16.4%, rgba(0, 0, 0, 1) 99.7%)",
  },
  {
    gradient: "linear-gradient(90deg, #ff6b6b, #ff8e53)",
    label: "Sunset Glow",
  },
  {
    gradient: "linear-gradient(45deg, #6b48ff, #00ddeb)",
    label: "Neon Pulse",
  },
  {
    gradient: "linear-gradient(135deg, #2afadf, #4c83ff)",
    label: "Aqua Dream",
  },
  {
    gradient: "linear-gradient(0deg, #1a1a3d, #4a4a8d)",
    label: "Midnight Sky",
  },
  {
    gradient: "linear-gradient(90deg, #ff9966, #ff5e62)",
    label: "Coral Reef",
  },
  {
    gradient: "linear-gradient(45deg, #f3ec78, #af4261)",
    label: "Retro Wave",
  },
  {
    gradient: "linear-gradient(135deg, #667eea, #764ba2)",
    label: "Purple Haze",
  },
  {
    gradient: "linear-gradient(90degLAPTOP, #00c9ff, #92fe9d)",
    label: "Tropical Breeze",
  },
  {
    gradient: "linear-gradient(0deg, #434343, #000000)",
    label: "Dark Void",
  },
  {
    gradient: "linear-gradient(45deg, #ffafbd, #ffc3a0)",
    label: "Peach Blossom",
  },
  {
    gradient: "linear-gradient(135deg, #e0c3fc, #8ec5fc)",
    label: "Pastel Sky",
  },
  {
    gradient: "linear-gradient(90deg, #12c2e9, #c471ed)",
    label: "Vivid Horizon",
  },
  {
    gradient: "linear-gradient(45deg, #f12711, #f5af19)",
    label: "Fire Storm",
  },
  {
    gradient: "linear-gradient(0deg, #a8ff78, #78ffd6)",
    label: "Lime Aqua",
  },
  {
    gradient: "linear-gradient(135deg, #ed4264, #ffedbc)",
    label: "Candy Floss",
  },
];

export const DEFAULT_CODE = `const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard-stats');
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
};`;

export const SUPPORTED_LANGUAGES = [
  { label: "TypeScript", value: "typescript" },
  { label: "tsx", value: "tsx" },
  { label: "jsx", value: "jsx" },
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "Go", value: "go" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "PHP", value: "php" },
  { label: "Ruby", value: "ruby" },
  { label: "Swift", value: "swift" },
  { label: "Kotlin", value: "kotlin" },
  { label: "Rust", value: "rust" },
  { label: "Dart", value: "dart" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "JSON", value: "json" },
  { label: "Markdown", value: "markdown" },
];

export const CODE_THEMES = [
  { label: "Atom Dark", value: atomDark },
  { label: "Material Light", value: materialLight },
  { label: "Material Dark", value: materialDark },
  { label: "Prism", value: prism },
  { label: "Twilight", value: twilight },
  { label: "Dracula", value: dracula },
  { label: "Solarized Light", value: solarizedlight },
  { label: "Duotone Forest", value: duotoneForest },
  { label: "Coldark Dark", value: coldarkDark },
  { label: "A11y Dark", value: a11yDark },
];

export const LOCAL_IMAGES = [
  {
    id: "local1",
    url: "/wallpaper/w1.jpg",
  },
  {
    id: "local2",
    url: "/wallpaper/w2.jpg",
  },
  {
    id: "local3",
    url: "/wallpaper/w3.jpg",
  },
  {
    id: "local4",
    url: "/wallpaper/w4.jpg",
  },
  {
    id: "local5",
    url: "/wallpaper/w5.jpg",
  },
  {
    id: "local6",
    url: "/wallpaper/w6.jpg",
  },
  {
    id: "local7",
    url: "/wallpaper/w7.jpg",
  },
  {
    id: "local8",
    url: "/wallpaper/w8.jpg",
  },
  {
    id: "local9",
    url: "/wallpaper/w9.jpg",
  },
];


type ResolutionPreset = {
  id: string;
  name: string;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
};

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  {
    id: "auto",
    name: "Auto",
    label: "Auto",
    width: 0,
    height: 0,
    aspectRatio: "auto",
  },
  {
    id: "square",
    name: "Square",
    label: "1:1",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
  },
  {
    id: "standard",
    name: "Standard",
    label: "4:3",
    width: 1280,
    height: 960,
    aspectRatio: "4:3",
  },
  {
    id: "golden",
    name: "Golden",
    label: "1.618:1",
    width: 1618,
    height: 1000,
    aspectRatio: "1.618:1",
  },
  {
    id: "widescreen",
    name: "Widescreen",
    label: "16:9",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
  },
  {
    id: "classic",
    name: "Classic",
    label: "3:2",
    width: 1500,
    height: 1000,
    aspectRatio: "3:2",
  },
  {
    id: "photo",
    name: "Photo",
    label: "5:4",
    width: 1250,
    height: 1000,
    aspectRatio: "5:4",
  },
  {
    id: "twitter-wide",
    name: "X (Twitter)",
    label: "16:9",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
  },
  {
    id: "twitter-header",
    name: "X Header",
    label: "3:1",
    width: 1500,
    height: 500,
    aspectRatio: "3:1",
  },
];