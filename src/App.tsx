import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Greetings from "./pages/Greetings";
import LetterMatching from "./pages/LetterMatching";
import Flashcards from "./pages/Flashcards";
import WordSearch from "./pages/WordSearch";
import Hangman from "./pages/Hangman";
import SentenceBuilder from "./pages/SentenceBuilder";
import MultipleChoice from "./pages/MultipleChoice";
import PronunciationChallenge from "./pages/PronunciationChallenge";
import MemoryGame from "./pages/MemoryGame";
import FillInTheBlank from "./pages/FillInTheBlank";
import Login from "./pages/Login";
import ImportWords from "./pages/ImportWords";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/greetings" element={<Greetings />} />
        <Route path="/letter-matching" element={<LetterMatching />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/word-search" element={<WordSearch />} />
        <Route path="/hangman" element={<Hangman />} />
        <Route path="/sentence-builder" element={<SentenceBuilder />} />
        <Route path="/multiple-choice" element={<MultipleChoice />} />
        <Route path="/pronunciation" element={<PronunciationChallenge />} />
        <Route path="/memory-game" element={<MemoryGame />} />
        <Route path="/fill-in-the-blank" element={<FillInTheBlank />} />
        <Route path="/login" element={<Login />} />
        <Route path="/import" element={<ImportWords />} />
      </Routes>
    </Router>
  );
}

export default App;