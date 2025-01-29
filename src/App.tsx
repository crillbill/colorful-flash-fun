import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import Index from "@/pages/Index";
import LetterMatching from "@/pages/LetterMatching";
import MultipleChoice from "@/pages/MultipleChoice";
import SentenceBuilder from "@/pages/SentenceBuilder";
import WordSearch from "@/pages/WordSearch";
import Flashcards from "@/pages/Flashcards";
import FillInTheBlank from "@/pages/FillInTheBlank";
import Dictionary from "@/pages/Dictionary";
import Greetings from "@/pages/Greetings";
import SpinTheWheel from "@/pages/SpinTheWheel";
import PronunciationChallenge from "@/pages/PronunciationChallenge";
import MemoryGame from "@/pages/MemoryGame";
import ScavengerHunt from "@/pages/ScavengerHunt";
import ScavengerHuntAdmin from "@/pages/ScavengerHuntAdmin";
import BulkImport from "@/pages/BulkImport";
import ImportWords from "@/pages/ImportWords";
import Login from "@/pages/Login";
import Hangman from "@/pages/Hangman";
import { ColorProvider } from "@/contexts/ColorContext";
import "./App.css";

function App() {
  return (
    <ColorProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/letter-matching" element={<LetterMatching />} />
          <Route path="/multiple-choice" element={<MultipleChoice />} />
          <Route path="/sentence-builder" element={<SentenceBuilder />} />
          <Route path="/word-search" element={<WordSearch />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/fill-in-the-blank" element={<FillInTheBlank />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/greetings" element={<Greetings />} />
          <Route path="/spin-the-wheel" element={<SpinTheWheel />} />
          <Route path="/pronunciation-challenge" element={<PronunciationChallenge />} />
          <Route path="/memory-game" element={<MemoryGame />} />
          <Route path="/scavenger-hunt" element={<ScavengerHunt />} />
          <Route path="/scavenger-hunt-admin" element={<ScavengerHuntAdmin />} />
          <Route path="/bulk-import" element={<BulkImport />} />
          <Route path="/import-words" element={<ImportWords />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hangman" element={<Hangman />} />
        </Routes>
        <Toaster />
        <SonnerToaster position="top-center" />
      </Router>
    </ColorProvider>
  );
}

export default App;