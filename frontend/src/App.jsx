import { useState, useEffect } from "react";
import "./App.css";
import { getMe } from "./services/api";
import Auth from "./components/Auth";
import Products from "./components/Products";
import MyPage from "./components/MyPage";
import Chat from "./components/Chat";

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [currentPage, setCurrentPage] = useState("home");
  const [chatProductId, setChatProductId] = useState(null);

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
    setCurrentPage("home");
  };

  const openChat = (productId) => {
    setChatProductId(productId);
    setCurrentPage("chat");
  };

  if (!user) {
    return (
      <div className="App">
        <div className="header">
          <div className="header-left">
            <h1>🥕 유니브당근</h1>
            <h2>더 나은 대학생활을 위한 중고 거래 플랫폼</h2>
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
          <h1>🥕 유니브당근</h1>
          <h2>더 나은 대학생활을 위한 중고 거래 플랫폼</h2>
        </div>
        <div className="header-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      <div className="user-info">
        <p><strong>{user.username}</strong>님 환영합니다!</p>
        <button className="danger" onClick={handleLogout}>로그아웃</button>
      </div>

      {currentPage === "home" && (
        <>
          <div className="nav-buttons">
            <button onClick={() => setCurrentPage("mypage")}>👤 마이페이지</button>
            <button onClick={() => setCurrentPage("chat")}>💬 채팅</button>
          </div>
          <Products user={user} onStartChat={openChat} />
        </>
      )}

      {currentPage === "mypage" && (
        <MyPage user={user} onBack={() => setCurrentPage("home")} />
      )}

      {currentPage === "chat" && (
        <Chat 
          user={user} 
          onBack={() => {
            setCurrentPage("home");
            setChatProductId(null);
          }}
          initialProductId={chatProductId}
        />
      )}
    </div>
  );
}

export default App;
