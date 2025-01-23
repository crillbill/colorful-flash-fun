import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Mic } from "lucide-react";
import { useState } from "react";
import VoiceInterface from "@/components/VoiceInterface";
import { AudioButton } from "@/components/AudioButton";
import { supabase } from "@/integrations/supabase/client";

const Greetings = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingSecond, setIsPlayingSecond] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isListeningSecond, setIsListeningSecond] = useState(false);
  const currentWord = "שלום"; // Shalom
  const secondWord = "מה שלומך היום"; // Ma shlomcha hayom

  const handlePlayAudio = async (word: string, setPlayingState: (state: boolean) => void) => {
    try {
      console.log('Greetings: Playing initial word pronunciation with Alloy voice');
      const response = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: word,
          voice: "alloy", // Explicitly using Alloy for initial word pronunciation
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate speech');
      }

      const { data: { audioContent } } = response;
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      
      setPlayingState(true);
      await audio.play();
      audio.onended = () => setPlayingState(false);
    } catch (error) {
      console.error("Greetings: Error playing audio:", error);
      toast.error("Failed to play audio");
      setPlayingState(false);
    }
  };

  const handlePronunciationResult = (isCorrect: boolean) => {
    setIsListening(false);
  };

  const handleSecondPronunciationResult = (isCorrect: boolean) => {
    setIsListeningSecond(false);
  };

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
              <AudioButton 
                isPlaying={isPlaying} 
                onToggle={() => handlePlayAudio(currentWord, setIsPlaying)} 
              />
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
              <AudioButton 
                isPlaying={isPlayingSecond} 
                onToggle={() => handlePlayAudio(secondWord, setIsPlayingSecond)} 
              />
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