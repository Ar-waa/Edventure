import React, { useState } from 'react';
import { getQuizByTopic } from '../Api/quizApi';

const QuizPage = () => {
  const [view, setView] = useState('menu'); // 'menu', 'dialogue', 'results'
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);

  const handleGenerate = async () => {
    if (!topic) return alert("Please enter a topic");
    
    setLoading(true);
    try {
      const result = await getQuizByTopic(topic);
      if (result.success) {
        setQuestions(result.data);
        setView('results');
      }
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#7c3aed] flex flex-col items-center justify-center p-4 font-sans">
      
      {/* 1. MAIN MENU */}
      {view === 'menu' && (
        <div className="flex flex-col sm:flex-row gap-6">
          <button 
            onClick={() => setView('dialogue')}
            className="w-64 h-40 bg-white text-black font-extrabold text-2xl rounded-2xl shadow-xl hover:bg-gray-100 transition-all border-b-4 border-gray-300"
          >
            TOPIC
          </button>
          <button 
            className="w-64 h-40 bg-white text-black font-extrabold text-2xl rounded-2xl shadow-xl opacity-60 cursor-not-allowed border-b-4 border-gray-300"
          >
            FLASHCARD
          </button>
        </div>
      )}

      {/* 2. DIALOGUE BOX & LOADING */}
      {view === 'dialogue' && (
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">What topic should we quiz?</h2>
            <input 
              autoFocus
              type="text" 
              className="w-full bg-gray-100 border-none p-4 rounded-xl text-lg focus:ring-2 focus:ring-purple-400 outline-none"
              placeholder="Enter topic here..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div className="mt-6 flex gap-3">
               <button onClick={() => setView('menu')} className="flex-1 py-3 font-semibold text-gray-500">Cancel</button>
               <button 
                onClick={handleGenerate}
                className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-md"
               >
                 Generate
               </button>
            </div>
          </div>
          {loading && <p className="mt-6 text-white text-lg font-medium animate-pulse">loading...</p>}
        </div>
      )}

      {/* 3. QUIZ RESULTS (Google Form Layout) */}
      {view === 'results' && (
        <div className="w-full max-w-2xl py-8 animate-fadeIn">
          <button 
            onClick={() => { setView('menu'); setTopic(''); }}
            className="text-white font-bold mb-6 flex items-center gap-2 hover:underline"
          >
            ← CREATE NEW QUIZ
          </button>
          
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden border-t-[12px] border-purple-900">
                <div className="p-6">
                  <p className="text-lg font-bold text-gray-800 mb-6">{idx + 1}. {q.question}</p>
                  <div className="space-y-4">
                    {q.options.map((option, i) => (
                      <label key={i} className="group flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors">
                        <input type="radio" name={`q-${idx}`} className="w-5 h-5 accent-purple-600" />
                        <span className="ml-4 text-gray-700 font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;