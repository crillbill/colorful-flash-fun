import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ColorProvider } from "@/contexts/ColorContext";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Home from "./pages/Home";
import Hangman from "@/pages/Hangman";
import LetterMatching from "@/pages/LetterMatching";
import MultipleChoice from "@/pages/MultipleChoice";
import SentenceBuilder from "@/pages/SentenceBuilder";
import WordSearch from "@/pages/WordSearch";
import "./App.css";

function App() {
  return (
    <ColorProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hangman" element={<Hangman />} />
            <Route path="/letter-matching" element={<LetterMatching />} />
            <Route path="/multiple-choice" element={<MultipleChoice />} />
            <Route path="/sentence-builder" element={<SentenceBuilder />} />
            <Route path="/word-search" element={<WordSearch />} />
          </Routes>
        </div>
        <Toaster />
        <SonnerToaster position="top-center" />
      </Router>
    </ColorProvider>
  );
}

export default App;