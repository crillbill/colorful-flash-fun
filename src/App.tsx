import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PronunciationChallenge from "./pages/PronunciationChallenge";
import Login from "./pages/Login";
import Flashcards from "./pages/Flashcards";
import Greetings from "./pages/Greetings";
import Hangman from "./pages/Hangman";
import LetterMatching from "./pages/LetterMatching";
import MultipleChoice from "./pages/MultipleChoice";
import SentenceBuilder from "./pages/SentenceBuilder";
import WordSearch from "./pages/WordSearch";
import ImportWords from "./pages/ImportWords";
import Index from "./pages/Index";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/pronunciation" element={<PronunciationChallenge />} />
          <Route path="/login" element={<Login />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/greetings" element={<Greetings />} />
          <Route path="/hangman" element={<Hangman />} />
          <Route path="/letter-matching" element={<LetterMatching />} />
          <Route path="/multiple-choice" element={<MultipleChoice />} />
          <Route path="/sentence-builder" element={<SentenceBuilder />} />
          <Route path="/word-search" element={<WordSearch />} />
          <Route path="/import-words" element={<ImportWords />} />
          <Route path="/" element={<Index />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;