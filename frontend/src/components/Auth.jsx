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
        setError("회원가입 완료! 로그인해주세요.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "로그인" : "회원가입"}</h2>
      
      {error && <p style={{ color: error.includes("완료") ? "green" : "red" }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        {!isLogin && (
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}
        
        <div>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
        </button>
      </form>
      
      <p>
        {isLogin ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
        <button type="button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "회원가입" : "로그인"}
        </button>
      </p>
    </div>
  );
}

export default Auth;
