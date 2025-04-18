export const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1617691819961-77948b5ece7c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fHdpbmRvd3MlMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D", // Placeholder for demo
  "https://images.unsplash.com/photo-1499428665502-503f6c608263?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fHdpbmRvd3MlMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D", // Placeholder for demo
  "https://images.unsplash.com/photo-1499428665502-503f6c608263?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fHdpbmRvd3MlMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D", // Placeholder for demo
  "https://images.unsplash.com/photo-1499428665502-503f6c608263?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fHdpbmRvd3MlMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D", // Placeholder for demo
];

export const MACOS_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWFjb3N8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1620120966883-d977b57a96ec?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hY29zfGVufDB8fDB8fHww",
  "https://images.unsplash.com/photo-1620121684840-edffcfc4b878?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fG1hY29zfGVufDB8fDB8fHww",
  "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fG1hY29zfGVufDB8fDB8fHww",
];

export const WINDOWS_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1637937267030-6d571ad57f3f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d2luZG93cyUyMHdhbGxwYXBlcnxlbnwwfHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFjb3MlMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bWFjb3MlMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fG1hY29zJTIwd2FsbHBhcGVyfGVufDB8fDB8fHww",
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
