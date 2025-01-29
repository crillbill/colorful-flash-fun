import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { ColorProvider } from '@/contexts/ColorContext';

// Import your pages
import Index from './pages/Index';
import Dictionary from './pages/Dictionary';
import Flashcards from './pages/Flashcards';
import MultipleChoice from './pages/MultipleChoice';
import SentenceBuilder from './pages/SentenceBuilder';
import MemoryGame from './pages/MemoryGame';
import FillInTheBlank from './pages/FillInTheBlank';
import PronunciationChallenge from './pages/PronunciationChallenge';
import SpinTheWheel from './pages/SpinTheWheel';
import WordSearch from './pages/WordSearch';
import ScavengerHunt from './pages/ScavengerHunt';
import ScavengerHuntAdmin from './pages/ScavengerHuntAdmin';
import BulkImport from './pages/BulkImport';
import ImportWords from './pages/ImportWords';
import Login from './pages/Login';
import Greetings from './pages/Greetings';
import Hangman from './pages/Hangman';
import LetterMatching from './pages/LetterMatching';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ColorProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dictionary" element={<Dictionary />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/multiple-choice" element={<MultipleChoice />} />
            <Route path="/sentence-builder" element={<SentenceBuilder />} />
            <Route path="/memory-game" element={<MemoryGame />} />
            <Route path="/fill-in-the-blank" element={<FillInTheBlank />} />
            <Route path="/pronunciation-challenge" element={<PronunciationChallenge />} />
            <Route path="/spin-the-wheel" element={<SpinTheWheel />} />
            <Route path="/word-search" element={<WordSearch />} />
            <Route path="/scavenger-hunt" element={<ScavengerHunt />} />
            <Route path="/scavenger-hunt-admin" element={<ScavengerHuntAdmin />} />
            <Route path="/bulk-import" element={<BulkImport />} />
            <Route path="/import-words" element={<ImportWords />} />
            <Route path="/login" element={<Login />} />
            <Route path="/greetings" element={<Greetings />} />
            <Route path="/hangman" element={<Hangman />} />
            <Route path="/letter-matching" element={<LetterMatching />} />
          </Routes>
          <Toaster />
        </Router>
      </ColorProvider>
    </QueryClientProvider>
  );
}

export default App;