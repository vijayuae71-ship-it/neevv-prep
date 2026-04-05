import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, Code2, Database, Terminal, Cpu, Layout } from 'lucide-react';

interface Question {
  id: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
}

interface TechQuestionBankProps {
  onPractice: (question: string) => void;
}

const questions: Question[] = [
  // DSA
  { id: 1, category: 'DSA', difficulty: 'Medium', question: 'Reverse a linked list — explain time/space complexity' },
  { id: 2, category: 'DSA', difficulty: 'Hard', question: 'Find the longest palindromic substring' },
  { id: 3, category: 'DSA', difficulty: 'Medium', question: 'Implement BFS and DFS for a graph' },
  { id: 4, category: 'DSA', difficulty: 'Hard', question: 'Detect a cycle in a directed graph' },
  { id: 5, category: 'DSA', difficulty: 'Medium', question: 'Find kth largest element in an unsorted array' },
  { id: 6, category: 'DSA', difficulty: 'Medium', question: 'Merge two sorted arrays in-place' },
  { id: 7, category: 'DSA', difficulty: 'Hard', question: 'Implement LRU Cache' },
  { id: 8, category: 'DSA', difficulty: 'Easy', question: 'Find all pairs with given sum in an array' },
  { id: 9, category: 'DSA', difficulty: 'Hard', question: 'Serialize and deserialize a binary tree' },
  { id: 10, category: 'DSA', difficulty: 'Hard', question: "Find shortest path in weighted graph (Dijkstra's)" },
  // SQL
  { id: 11, category: 'SQL', difficulty: 'Easy', question: 'Write a query to find the second highest salary' },
  { id: 12, category: 'SQL', difficulty: 'Easy', question: 'Find duplicate records in a table' },
  { id: 13, category: 'SQL', difficulty: 'Medium', question: 'Write a self-join to find employees earning more than their manager' },
  { id: 14, category: 'SQL', difficulty: 'Medium', question: 'Pivot rows to columns using CASE WHEN' },
  { id: 15, category: 'SQL', difficulty: 'Medium', question: 'Window functions: running total and rank' },
  { id: 16, category: 'SQL', difficulty: 'Hard', question: 'Optimize a slow query with proper indexing strategy' },
  { id: 17, category: 'SQL', difficulty: 'Hard', question: 'Write a query for consecutive login days' },
  { id: 18, category: 'SQL', difficulty: 'Easy', question: 'Difference between INNER JOIN, LEFT JOIN, CROSS JOIN with examples' },
  // Python
  { id: 19, category: 'Python', difficulty: 'Easy', question: 'Explain list vs tuple vs set — when to use each' },
  { id: 20, category: 'Python', difficulty: 'Medium', question: 'Implement a decorator with arguments' },
  { id: 21, category: 'Python', difficulty: 'Medium', question: 'Generator functions and yield — build a Fibonacci generator' },
  { id: 22, category: 'Python', difficulty: 'Hard', question: 'Explain GIL and its impact on multithreading' },
  { id: 23, category: 'Python', difficulty: 'Easy', question: 'Dictionary comprehension and defaultdict use cases' },
  { id: 24, category: 'Python', difficulty: 'Medium', question: 'Implement a context manager using __enter__ and __exit__' },
  { id: 25, category: 'Python', difficulty: 'Easy', question: 'Difference between deepcopy and shallow copy' },
  { id: 26, category: 'Python', difficulty: 'Medium', question: 'Write a Python script to parse and analyze a CSV file' },
  // Java
  { id: 27, category: 'Java', difficulty: 'Easy', question: 'Explain OOP concepts with real-world examples' },
  { id: 28, category: 'Java', difficulty: 'Medium', question: 'ArrayList vs LinkedList — performance comparison' },
  { id: 29, category: 'Java', difficulty: 'Medium', question: 'Interface vs Abstract Class — when to use each' },
  { id: 30, category: 'Java', difficulty: 'Medium', question: 'Exception handling: checked vs unchecked exceptions' },
  { id: 31, category: 'Java', difficulty: 'Hard', question: 'Multithreading: synchronized vs ReentrantLock' },
  { id: 32, category: 'Java', difficulty: 'Hard', question: 'HashMap internal working and collision handling' },
  { id: 33, category: 'Java', difficulty: 'Medium', question: 'SOLID principles with code examples' },
  { id: 34, category: 'Java', difficulty: 'Medium', question: 'Design patterns: Singleton, Factory, Observer' },
  // System Design
  { id: 35, category: 'System Design', difficulty: 'Hard', question: 'Design a URL shortener (like bit.ly)' },
  { id: 36, category: 'System Design', difficulty: 'Hard', question: 'Design a chat application (like WhatsApp)' },
  { id: 37, category: 'System Design', difficulty: 'Medium', question: 'Design a rate limiter' },
  { id: 38, category: 'System Design', difficulty: 'Hard', question: 'Design a file storage system (like Google Drive)' },
  { id: 39, category: 'System Design', difficulty: 'Medium', question: 'Design an e-commerce search system' },
  { id: 40, category: 'System Design', difficulty: 'Medium', question: 'Design a notification service' },
];

const categories = ['All', 'DSA', 'SQL', 'Python', 'Java', 'System Design'];

const categoryColors: Record<string, string> = {
  DSA: 'badge-primary',
  SQL: 'badge-secondary',
  Python: 'badge-accent',
  Java: 'badge-info',
  'System Design': 'badge-warning',
};

const difficultyColors: Record<string, string> = {
  Easy: 'badge-success',
  Medium: 'badge-warning',
  Hard: 'badge-error',
};

const categoryIcons: Record<string, React.ReactNode> = {
  DSA: <Cpu className="w-4 h-4" />,
  SQL: <Database className="w-4 h-4" />,
  Python: <Terminal className="w-4 h-4" />,
  Java: <Code2 className="w-4 h-4" />,
  'System Design': <Layout className="w-4 h-4" />,
};

export const TechQuestionBank: React.FC<TechQuestionBankProps> = ({ onPractice }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      const matchesCategory = activeCategory === 'All' || q.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: questions.length };
    questions.forEach((q) => {
      map[q.category] = (map[q.category] || 0) + 1;
    });
    return map;
  }, []);

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            📚 Technical Question Bank
          </h1>
          <p className="text-base-content/70">
            {questions.length} curated questions across {categories.length - 1} categories
          </p>
        </div>

        {/* Search Bar */}
        <div className="form-control mb-4">
          <div className="input-group">
            <span className="bg-base-300">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search questions..."
              className="input input-bordered w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="tabs tabs-boxed bg-base-100 mb-6 flex-wrap justify-center p-2">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab gap-1 ${activeCategory === cat ? 'tab-active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat !== 'All' && categoryIcons[cat]}
              {cat}
              <span className="badge badge-sm badge-ghost">{counts[cat] || 0}</span>
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-base-content/60 mb-3">
          Showing {filtered.length} question{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Question Cards */}
        <div className="space-y-3">
          {filtered.map((q) => (
            <div
              key={q.id}
              className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="card-body p-4 flex-row items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`badge ${categoryColors[q.category]} badge-sm gap-1`}>
                      {categoryIcons[q.category]}
                      {q.category}
                    </span>
                    <span className={`badge ${difficultyColors[q.difficulty]} badge-sm badge-outline`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-base-content font-medium">{q.question}</p>
                </div>
                <button
                  className="btn btn-primary btn-sm gap-1 shrink-0"
                  onClick={() => onPractice(q.question)}
                >
                  Practice This
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-base-content/50 text-lg">No questions match your search.</p>
              <button
                className="btn btn-ghost btn-sm mt-2"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
