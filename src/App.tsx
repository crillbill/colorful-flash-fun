import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Greetings from "@/pages/Greetings";
import LetterMatching from "@/pages/LetterMatching";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/greetings" element={<Greetings />} />
        <Route path="/letter-matching" element={<LetterMatching />} />
      </Routes>
    </Router>
  );
}

export default App;