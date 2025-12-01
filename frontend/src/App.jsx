import { useState, useEffect } from "react";
import "./App.css";
import { getHealth, getTest, postEcho, getMe } from "./services/api";
import Auth from "./components/Auth";

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [healthStatus, setHealthStatus] = useState(null);
  const [testData, setTestData] = useState(null);
  const [echoResult, setEchoResult] = useState(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch {
        localStorage.removeItem("token");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const data = await getHealth();
      setHealthStatus(data);
      setError(null);
    } catch (err) {
      setError("Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  const fetchTest = async () => {
    try {
      setLoading(true);
      const data = await getTest();
      setTestData(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch test data");
    } finally {
      setLoading(false);
    }
  };

  const handleEcho = async () => {
    if (!inputText.trim()) return;
    try {
      setLoading(true);
      const data = await postEcho({ message: inputText });
      setEchoResult(data);
      setError(null);
    } catch (err) {
      setError("Failed to send data");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="App">
        <div className="header">
          <div className="header-left">
            <h1>Project Alpha</h1>
            <h2>Welcome! Please login or register.</h2>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
        <Auth onLogin={setUser} />
      </div>
    );
  }

  return (
    <div className="App">
      <div className="header">
        <div className="header-left">
          <h1>Project Alpha</h1>
          <h2>React + Flask Integration</h2>
        </div>
        <div className="header-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      <div className="user-info">
        <p>Welcome, <strong>{user.username}</strong>!</p>
        <button className="danger" onClick={handleLogout}>Logout</button>
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      <div className="section">
        <h3>🏥 Backend Health Status</h3>
        <button onClick={fetchHealth} disabled={loading}>Check Health</button>
        {healthStatus && <pre>{JSON.stringify(healthStatus, null, 2)}</pre>}
      </div>

      <div className="section">
        <h3>🧪 Test API Call</h3>
        <button onClick={fetchTest} disabled={loading}>Fetch Test Data</button>
        {testData && <pre>{JSON.stringify(testData, null, 2)}</pre>}
      </div>

      <div className="section">
        <h3>📤 Echo Test (POST)</h3>
        <div className="input-group">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to echo"
          />
          <button onClick={handleEcho} disabled={loading || !inputText.trim()}>
            Send
          </button>
        </div>
        {echoResult && <pre>{JSON.stringify(echoResult, null, 2)}</pre>}
      </div>

      {loading && <p className="loading">Loading...</p>}
    </div>
  );
}

export default App;
