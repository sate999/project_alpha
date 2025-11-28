import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Click the button!");

  const handleClick = () => {
    setMessage("Button clicked! Frontend is working!");
  };

  return (
    <div className="App">
      <h1>Project Alpha</h1>
      <h2>Frontend Test</h2>

      <div style={{ margin: "20px" }}>
        <button onClick={handleClick}>Click Me!</button>
      </div>

      <p>{message}</p>
    </div>
  );
}

export default App;
