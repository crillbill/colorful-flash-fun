import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Greetings = () => {
  const handleGreet = () => {
    toast("Hello there! 👋");
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
            <p className="text-lg text-center text-muted-foreground">
              Click the button below to receive a friendly greeting!
            </p>
            <Button onClick={handleGreet} size="lg">
              Greet Me!
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Greetings;