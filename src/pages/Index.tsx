import { useState } from "react";
import { FlashCard } from "@/components/FlashCard";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { toast } from "sonner";

const flashcards = [
  { question: "א", answer: "Alef (silent or glottal stop)" },
  { question: "ב", answer: "Bet (B as in 'boy' or V as in 'vet')" },
  { question: "ג", answer: "Gimel (G as in 'go')" },
  { question: "ד", answer: "Dalet (D as in 'dog')" },
  { question: "ה", answer: "Heh (H as in 'house')" },
  { question: "ו", answer: "Vav (V as in 'vet' or O/U as in 'go'/'blue')" },
  { question: "ז", answer: "Zayin (Z as in 'zoo')" },
  { question: "ח", answer: "Chet (guttural CH, like in 'Bach')" },
  { question: "ט", answer: "Tet (T as in 'table')" },
  { question: "י", answer: "Yod (Y as in 'yes' or I as in 'machine')" },
  { question: "כ", answer: "Kaf (K as in 'kite' or KH as in 'Bach')" },
  { question: "ך", answer: "Final Kaf (KH as in 'Bach')" },
  { question: "ל", answer: "Lamed (L as in 'lamp')" },
  { question: "מ", answer: "Mem (M as in 'mother')" },
  { question: "ם", answer: "Final Mem (M as in 'mother')" },
  { question: "נ", answer: "Nun (N as in 'noon')" },
  { question: "ן", answer: "Final Nun (N as in 'noon')" },
  { question: "ס", answer: "Samekh (S as in 'sun')" },
  { question: "ע", answer: "Ayin (guttural sound, no English equivalent)" },
  { question: "פ", answer: "Peh (P as in 'pen' or F as in 'fun')" },
  { question: "ף", answer: "Final Peh (F as in 'fun')" },
  { question: "צ", answer: "Tzadi (TS as in 'cats')" },
  { question: "ץ", answer: "Final Tzadi (TS as in 'cats')" },
  { question: "ק", answer: "Qof (K as in 'kite')" },
  { question: "ר", answer: "Resh (R as in 'run,' but rolled slightly)" },
  { question: "ש", answer: "Shin (SH as in 'ship' or S as in 'sun')" },
  { question: "ת", answer: "Tav (T as in 'table' or S as in 'sun' in some traditions)" },
];

const Index = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const handleNext = () => {
    if (currentCard === flashcards.length - 1) {
      toast("Congratulations! You've completed all cards!");
      setCurrentCard(0);
    } else {
      setCurrentCard(currentCard + 1);
    }
  };

  const handleCorrect = () => {
    setCorrectAnswers(correctAnswers + 1);
    setTotalAnswered(totalAnswered + 1);
    toast.success("Correct! Well done!");
  };

  const handleIncorrect = () => {
    setTotalAnswered(totalAnswered + 1);
    toast.error("Incorrect. Keep trying!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">
          Hebrew Letters Flashcards
        </h1>
        
        <ScoreDisplay correct={correctAnswers} total={totalAnswered} />
        <ProgressBar current={currentCard + 1} total={flashcards.length} />
        
        <FlashCard
          question={flashcards[currentCard].question}
          answer={flashcards[currentCard].answer}
          onNext={handleNext}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
        />
      </div>
    </div>
  );
};

export default Index;