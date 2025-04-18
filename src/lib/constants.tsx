export const PREDEFINED_IMAGES = [
  { id: "img1", url: "https://images.unsplash.com/photo-1557683316-973673baf926", label: "Abstract Blue" },
  { id: "img2", url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85", label: "Purple Haze" },
  { id: "img3", url: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5", label: "Neon Glow" },
  { id: "img4", url: "https://images.unsplash.com/photo-1557682260-96773eb01377", label: "Dark Waves" },
  { id: "img5", url: "https://images.unsplash.com/photo-1557682268-9b00e19d9a0b", label: "Soft Gradient" },
  { id: "img6", url: "https://images.unsplash.com/photo-1557682257-2f9c5810fd99", label: "Cosmic Dust" },
  { id: "img7", url: "https://images.unsplash.com/photo-1557682282-9e19f4c3e4b9", label: "Aurora" },
  { id: "img8", url: "https://images.unsplash.com/photo-1557682293-6b9a23677597", label: "Blurry Lights" },
  { id: "img9", url: "https://images.unsplash.com/photo-1557682302-9f1b1b8f8c9f", label: "Ocean Breeze" },
  { id: "img10", url: "https://images.unsplash.com/photo-1557682317-7c9b8c8f8c9f", label: "Night Sky" },
  { id: "img11", url: "https://images.unsplash.com/photo-1557682324-9c9b8c8f8c9f", label: "Fire Glow" },
  { id: "img12", url: "https://images.unsplash.com/photo-1557682335-9c9b8c8f8c9f", label: "Minimal Wave" },
  { id: "img13", url: "https://images.unsplash.com/photo-1557682346-9c9b8c8f8c9f", label: "Pastel Dream" },
  { id: "img14", url: "https://images.unsplash.com/photo-1557682357-9c9b8c8f8c9f", label: "Vivid Abstract" },
  { id: "img15", url: "https://images.unsplash.com/photo-1557682368-9c9b8c8f8c9f", label: "Twilight" },
];

export const PREDEFINED_GRADIENTS = [
  { id: "grad1", value: "linear-gradient(90deg, #ff6b6b, #ff8e53)", label: "Sunset Glow" },
  { id: "grad2", value: "linear-gradient(45deg, #6b48ff, #00ddeb)", label: "Neon Pulse" },
  { id: "grad3", value: "linear-gradient(135deg, #2afadf, #4c83ff)", label: "Aqua Dream" },
  { id: "grad4", value: "linear-gradient(0deg, #1a1a3d, #4a4a8d)", label: "Midnight Sky" },
  { id: "grad5", value: "linear-gradient(90deg, #ff9966, #ff5e62)", label: "Coral Reef" },
  { id: "grad6", value: "linear-gradient(45deg, #f3ec78, #af4261)", label: "Retro Wave" },
  { id: "grad7", value: "linear-gradient(135deg, #667eea, #764ba2)", label: "Purple Haze" },
  { id: "grad8", value: "linear-gradient(90degLAPTOP, #00c9ff, #92fe9d)", label: "Tropical Breeze" },
  { id: "grad9", value: "linear-gradient(0deg, #434343, #000000)", label: "Dark Void" },
  { id: "grad10", value: "linear-gradient(45deg, #ffafbd, #ffc3a0)", label: "Peach Blossom" },
  { id: "grad11", value: "linear-gradient(135deg, #e0c3fc, #8ec5fc)", label: "Pastel Sky" },
  { id: "grad12", value: "linear-gradient(90deg, #12c2e9, #c471ed)", label: "Vivid Horizon" },
  { id: "grad13", value: "linear-gradient(45deg, #f12711, #f5af19)", label: "Fire Storm" },
  { id: "grad14", value: "linear-gradient(0deg, #a8ff78, #78ffd6)", label: "Lime Aqua" },
  { id: "grad15", value: "linear-gradient(135deg, #ed4264, #ffedbc)", label: "Candy Floss" },
];

export const GRADIENT_BACKGROUNDS = [
  "linear-gradient(to right, #ff758c, #ff7eb3)",
  "linear-gradient(to right, #4facfe, #00f2fe)",
  "linear-gradient(to right, #0ba360, #3cba92)",
  "linear-gradient(to right, #8e2de2, #4a00e0)",
  "linear-gradient(to right, #f43b47, #453a94)",
  "linear-gradient(to right, #0f0c29, #302b63, #24243e)",
  "linear-gradient(to right, #2c3e50, #4ca1af)",
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
};`

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
]
