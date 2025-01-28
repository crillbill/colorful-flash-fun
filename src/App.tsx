import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Flashcards from "./pages/Flashcards";
import MultipleChoice from "./pages/MultipleChoice";
import WordSearch from "./pages/WordSearch";
import LetterMatching from "./pages/LetterMatching";
import FillInTheBlank from "./pages/FillInTheBlank";
import SentenceBuilder from "./pages/SentenceBuilder";
import Hangman from "./pages/Hangman";
import MemoryGame from "./pages/MemoryGame";
import PronunciationChallenge from "./pages/PronunciationChallenge";
import Login from "./pages/Login";
import Greetings from "./pages/Greetings";
import ImportWords from "./pages/ImportWords";
import SpinTheWheel from "./pages/SpinTheWheel";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a new client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/multiple-choice" element={<MultipleChoice />} />
          <Route path="/word-search" element={<WordSearch />} />
          <Route path="/letter-matching" element={<LetterMatching />} />
          <Route path="/fill-in-the-blank" element={<FillInTheBlank />} />
          <Route path="/sentence-builder" element={<SentenceBuilder />} />
          <Route path="/hangman" element={<Hangman />} />
          <Route path="/memory-game" element={<MemoryGame />} />
          <Route path="/pronunciation-challenge" element={<PronunciationChallenge />} />
          <Route path="/login" element={<Login />} />
          <Route path="/greetings" element={<Greetings />} />
          <Route path="/import-words" element={<ImportWords />} />
          <Route path="/spin-the-wheel" element={<SpinTheWheel />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;