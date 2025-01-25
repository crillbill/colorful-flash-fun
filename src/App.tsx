import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Greetings from "@/pages/Greetings";
import LetterMatching from "@/pages/LetterMatching";
import Flashcards from "@/pages/Flashcards";
import WordSearch from "@/pages/WordSearch";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/greetings" element={<Greetings />} />
        <Route path="/letter-matching" element={<LetterMatching />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/word-search" element={<WordSearch />} />
      </Routes>
    </Router>
  );
}

export default App;