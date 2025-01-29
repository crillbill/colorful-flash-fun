import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import Login from "./pages/Login";
import MultipleChoice from "./pages/MultipleChoice";
import SentenceBuilder from "./pages/SentenceBuilder";
import WordSearch from "./pages/WordSearch";
import Hangman from "./pages/Hangman";
import LetterMatching from "./pages/LetterMatching";
import Flashcards from "./pages/Flashcards";
import Dictionary from "./pages/Dictionary";
import BulkImport from "./pages/BulkImport";
import ImportWords from "./pages/ImportWords";
import FillInTheBlank from "./pages/FillInTheBlank";
import SpinTheWheel from "./pages/SpinTheWheel";
import MemoryGame from "./pages/MemoryGame";
import ScavengerHunt from "./pages/ScavengerHunt";
import ScavengerHuntAdmin from "./pages/ScavengerHuntAdmin";
import PronunciationChallenge from "./pages/PronunciationChallenge";
import Greetings from "./pages/Greetings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/multiple-choice" element={<MultipleChoice />} />
        <Route path="/sentence-builder" element={<SentenceBuilder />} />
        <Route path="/word-search" element={<WordSearch />} />
        <Route path="/hangman" element={<Hangman />} />
        <Route path="/letter-matching" element={<LetterMatching />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/dictionary" element={<Dictionary />} />
        <Route path="/bulk-import" element={<BulkImport />} />
        <Route path="/import-words" element={<ImportWords />} />
        <Route path="/fill-in-the-blank" element={<FillInTheBlank />} />
        <Route path="/spin-the-wheel" element={<SpinTheWheel />} />
        <Route path="/memory-game" element={<MemoryGame />} />
        <Route path="/scavenger-hunt" element={<ScavengerHunt />} />
        <Route path="/scavenger-hunt-admin" element={<ScavengerHuntAdmin />} />
        <Route path="/pronunciation" element={<PronunciationChallenge />} />
        <Route path="/greetings" element={<Greetings />} />
      </Routes>
      <Toaster position="top-center" expand={true} richColors />
    </Router>
  );
}

export default App;