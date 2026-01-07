const QuizQuestions = ({ quiz }) => {
  return (
    <div className="questions-container">
      <h2 className="quiz-title">{quiz.topic}</h2>

      {quiz.questions.map((q, idx) => (
        <div className="question-card" key={idx}>
          <p className="question-text">
            {idx + 1}. {q.question}
          </p>

          <div className="options">
            {Object.entries(q.options).map(([key, value]) => (
              <label key={key} className="option">
                <input type="radio" name={`q-${idx}`} disabled />
                {key}. {value}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizQuestions;
