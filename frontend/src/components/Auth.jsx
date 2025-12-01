import { useState } from "react";
import { login, register } from "../services/api";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const data = await login(username, password);
        localStorage.setItem("token", data.access_token);
        onLogin(data.user);
      } else {
        await register(username, email, password);
        setIsLogin(true);
        setError("Registration successful! Please login.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      
      {error && <p style={{ color: error.includes("successful") ? "green" : "red" }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        {!isLogin && (
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}
        
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : isLogin ? "Login" : "Register"}
        </button>
      </form>
      
      <p>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button type="button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}

export default Auth;
