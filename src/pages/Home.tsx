import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Welcome to Hebrew Learning</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/hangman" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Hangman</h2>
          <p className="text-gray-600">Test your Hebrew vocabulary with a classic game of Hangman.</p>
        </Link>
        <Link to="/letter-matching" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Letter Matching</h2>
          <p className="text-gray-600">Practice matching Hebrew letters with their correct sounds.</p>
        </Link>
        <Link to="/multiple-choice" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Multiple Choice</h2>
          <p className="text-gray-600">Test your knowledge with multiple choice questions.</p>
        </Link>
        <Link to="/sentence-builder" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Sentence Builder</h2>
          <p className="text-gray-600">Learn to construct Hebrew sentences.</p>
        </Link>
        <Link to="/word-search" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Word Search</h2>
          <p className="text-gray-600">Find Hebrew words in a puzzle grid.</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;