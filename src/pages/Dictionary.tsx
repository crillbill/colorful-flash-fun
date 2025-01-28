import { Header1 } from "@/components/ui/header";
import { Card } from "@/components/ui/card";

const Dictionary = () => {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Header1 className="mb-8">Hebrew Dictionary</Header1>
      <Card className="p-6">
        {/* Search bar will go here */}
        <div className="min-h-[400px]">
          {/* Results will go here */}
        </div>
      </Card>
    </div>
  );
};

export default Dictionary;