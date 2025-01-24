import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Mic, Volume2 } from "lucide-react";
import { useState, useEffect } from "react";
import VoiceInterface from "@/components/VoiceInterface";
import { supabase } from "@/integrations/supabase/client";

const Greetings = () => {
  const [isListening, setIsListening] = useState(false);
  const [isListeningSecond, setIsListeningSecond] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentWord = "שלום"; // Shalom
  const secondWord = "מה שלומך היום"; // Ma shlomcha hayom

  const getPronunciationTip = (word: string) => {
    const tips: { [key: string]: string } = {
      'שלום': "Try saying 'sha-LOHM' with emphasis on the second syllable",
      'מה שלומך היום': "Break it down: 'ma' (like 'ma' in mama) + 'shlo-m-CHA' + 'ha-YOM'",
    };
    return tips[word] || "";
  };

  const handlePronunciationResult = (isCorrect: boolean) => {
    setIsListening(false);
    if (isCorrect) {
      toast.success(`Wow! You really pronounced '${currentWord}' great!`);
      speakWord("Excellent pronunciation!", false);
    } else {
      const tip = getPronunciationTip(currentWord);
      toast.error(`Let's try '${currentWord}' again. ${tip}`);
      speakWord(`Let's try that again. ${tip}`, false).then(() => {
        setTimeout(() => setIsListening(true), 1500);
      });
    }
  };

  const handleSecondPronunciationResult = (isCorrect: boolean) => {
    setIsListeningSecond(false);
    if (isCorrect) {
      toast.success(`Perfect! You pronounced '${secondWord}' beautifully!`);
      speakWord("Excellent pronunciation!", false);
    } else {
      const tip = getPronunciationTip(secondWord);
      toast.error(`Let's practice '${secondWord}' again. ${tip}`);
      speakWord(`Let's try that again. ${tip}`, false).then(() => {
        setTimeout(() => setIsListeningSecond(true), 1500);
      });
    }
  };

  const speakWord = async (word: string, isHebrew = true) => {
    if (isSpeaking) {
      return;
    }

    try {
      setIsSpeaking(true);
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: word,
          voice: isHebrew ? 'alloy' : 'echo'
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const audioContent = response.data.audioContent;
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      
      return new Promise<void>((resolve) => {
        audio.onended = () => {
          setIsSpeaking(false);
          resolve();
        };

        audio.onerror = () => {
          console.error('Error playing audio');
          setIsSpeaking(false);
          toast.error("Failed to play the word");
          resolve();
        };

        audio.play().catch((error) => {
          console.error('Error playing audio:', error);
          setIsSpeaking(false);
          toast.error("Failed to play the word");
          resolve();
        });
      });
    } catch (error) {
      console.error('Error speaking word:', error);
      toast.error("Failed to speak the word");
      setIsSpeaking(false);
      return Promise.resolve();
    }
  };

  // ... keep existing code (JSX for the component's UI)

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Back to Hebrew Letters
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-center text-primary">
              Welcome to Greetings
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xl">Hello</span>
              <span className="text-xl font-bold">{currentWord}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => speakWord(currentWord, true)}
                disabled={isSpeaking}
                className={isSpeaking ? "bg-blue-100" : ""}
              >
                <Volume2 className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsListening(true)}
                className={isListening ? "bg-red-100" : ""}
              >
                <Mic className="h-6 w-6" />
              </Button>
            </div>
            <VoiceInterface
              currentWord={currentWord}
              onPronunciationResult={handlePronunciationResult}
              isListening={isListening}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-center text-primary">
              How are you today?
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xl">How are you today?</span>
              <span className="text-xl font-bold">{secondWord}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => speakWord(secondWord, true)}
                disabled={isSpeaking}
                className={isSpeaking ? "bg-blue-100" : ""}
              >
                <Volume2 className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsListeningSecond(true)}
                className={isListeningSecond ? "bg-red-100" : ""}
              >
                <Mic className="h-6 w-6" />
              </Button>
            </div>
            <VoiceInterface
              currentWord={secondWord}
              onPronunciationResult={handleSecondPronunciationResult}
              isListening={isListeningSecond}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Greetings;
