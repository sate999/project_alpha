import { useState, useEffect } from "react";
import "./App.css";
import { getHealth, getTest, postEcho } from "./services/api";

function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [testData, setTestData] = useState(null);
  const [echoResult, setEchoResult] = useState(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 시 Health Check
  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const data = await getHealth();
      setHealthStatus(data);
      setError(null);
    } catch (err) {
      setError("Failed to connect to backend");
      console.error(err);
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
      console.error(err);
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Project Alpha</h1>
      <h2>React + Flask Integration Test</h2>

      {error && (
        <div style={{ color: "red", padding: "10px", margin: "10px 0" }}>
          ❌ {error}
        </div>
      )}

      {/* Health Status */}
      <div className="section">
        <h3>Backend Health Status</h3>
        <button onClick={fetchHealth} disabled={loading}>
          Check Health
        </button>
        {healthStatus && <pre>{JSON.stringify(healthStatus, null, 2)}</pre>}
      </div>

      {/* Test Data */}
      <div className="section">
        <h3>Test API Call</h3>
        <button onClick={fetchTest} disabled={loading}>
          Fetch Test Data
        </button>
        {testData && <pre>{JSON.stringify(testData, null, 2)}</pre>}
      </div>

      {/* Echo Test */}
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
