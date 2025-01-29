import { Header1 } from "@/components/ui/header";

const ThematicLearning = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <Header1 />
      <div className="container mx-auto px-4 py-16 mt-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Thematic Learning</h1>
        <p className="text-lg text-gray-700 mb-8">
          Learn Hebrew through themed categories and contextual learning experiences.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add themed category cards here as the feature develops */}
        </div>
      </div>
    </div>
  );
};

export default ThematicLearning;