import { useState, useEffect } from "react";
import "./App.css";
import { getHealth, getTest, postEcho, getMe } from "./services/api";
import Auth from "./components/Auth";

function App() {
  const [user, setUser] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [testData, setTestData] = useState(null);
  const [echoResult, setEchoResult] = useState(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

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
        <h1>Project Alpha</h1>
        <Auth onLogin={setUser} />
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Project Alpha</h1>
      
      <div className="user-info">
        <p>Welcome, <strong>{user.username}</strong>!</p>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {error && <div style={{ color: "red", padding: "10px" }}>❌ {error}</div>}

      <div className="section">
        <h3>Backend Health Status</h3>
        <button onClick={fetchHealth} disabled={loading}>Check Health</button>
        {healthStatus && <pre>{JSON.stringify(healthStatus, null, 2)}</pre>}
      </div>

      <div className="section">
        <h3>Test API Call</h3>
        <button onClick={fetchTest} disabled={loading}>Fetch Test Data</button>
        {testData && <pre>{JSON.stringify(testData, null, 2)}</pre>}
      </div>

      <div className="section">
        <h3>Echo Test (POST)</h3>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to echo"
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button onClick={handleEcho} disabled={loading || !inputText.trim()}>
          Send to Backend
        </button>
        {echoResult && <pre>{JSON.stringify(echoResult, null, 2)}</pre>}
      </div>

      {loading && <p>Loading...</p>}
    </div>
  );
}

export default App;
