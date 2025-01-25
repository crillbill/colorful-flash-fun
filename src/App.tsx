import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Flashcards from "./pages/Flashcards";
import MultipleChoice from "./pages/MultipleChoice";
import WordSearch from "./pages/WordSearch";
import LetterMatching from "./pages/LetterMatching";
import Hangman from "./pages/Hangman";
import SentenceBuilder from "./pages/SentenceBuilder";
import Greetings from "./pages/Greetings";
import PronunciationChallenge from "./pages/PronunciationChallenge";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/multiple-choice" element={<MultipleChoice />} />
        <Route path="/word-search" element={<WordSearch />} />
        <Route path="/letter-matching" element={<LetterMatching />} />
        <Route path="/hangman" element={<Hangman />} />
        <Route path="/sentence-builder" element={<SentenceBuilder />} />
        <Route path="/greetings" element={<Greetings />} />
        <Route path="/pronunciation" element={<PronunciationChallenge />} />
      </Routes>
    </Router>
  );
}

export default App;