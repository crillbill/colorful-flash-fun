import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PronunciationChallenge from "./pages/PronunciationChallenge";
import Login from "./pages/Login";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/pronunciation" element={<PronunciationChallenge />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PronunciationChallenge />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;