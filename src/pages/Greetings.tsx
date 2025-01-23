import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Mic } from "lucide-react";
import { useState } from "react";
import VoiceInterface from "@/components/VoiceInterface";
import { supabase } from "@/integrations/supabase/client";

const Greetings = () => {
  const [isListening, setIsListening] = useState(false);
  const [isListeningSecond, setIsListeningSecond] = useState(false);
  const currentWord = "שלום"; // Shalom
  const secondWord = "מה שלומך היום"; // Ma shlomcha hayom

  const handlePronunciationResult = (isCorrect: boolean) => {
    setIsListening(false);
    if (isCorrect) {
      toast.success("Great pronunciation!");
    } else {
      toast.error("Let's try that again");
    }
  };

  const handleSecondPronunciationResult = (isCorrect: boolean) => {
    setIsListeningSecond(false);
    if (isCorrect) {
      toast.success("Excellent!");
    } else {
      toast.error("Keep practicing!");
    }
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