import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { TailSpin } from 'react-loader-spinner';

interface CorrectAnswers {
  [key: string]: string[];
}

function Answers() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<CorrectAnswers>({});
  const [userAnswer, setUserAnswer] = useState<CorrectAnswers>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [marks, setMarks] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(50);
  const [count, setCount] = useState<number>(0);

  const location = useLocation();
  const { id, class_id } = location.state || {};

  // Function to handle navigation
  const handleNavigation = (direction: 'prev' | 'next') => {
    setCurrentQuestion((prev) =>
      direction === 'prev'
        ? Math.max(0, prev - 1)
        : Math.min(totalQuestions - 1, prev + 1),
    );
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.post('/getcorrectanswers', {
        exam_id: id,
        class_id: class_id,
      });
      setAnswers(response.data.correct_answers[0] || {});
    } catch (error) {
      toast.error('Something Went Wrong Please Try Again');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAnswers = async () => {
    try {
      setLoading(true);
      const response = await api.post('/getanswers', {
        exam_id: id,
        class_id: class_id,
      });
      const decodedAnswers = JSON.parse(response.data.answers[0].answer);
      const decodedCount = response.data.count;

      setUserAnswer(decodedAnswers);
      setCount(decodedCount);
      setMarks(response.data.answers[0].marks);
      setTotalQuestions(decodedCount);
    } catch (error) {
      toast.error('Something Went Wrong Please Try Again');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUserAnswers();
  }, []);

  const isCorrectAnswer = (optionIndex: number) => {
    const questionKey = `Q${currentQuestion + 1}`;
    return answers[questionKey]?.map(Number).includes(optionIndex) || false;
  };

  const isUserAnswer = (optionIndex: number) => {
    const questionKey = `Q${currentQuestion + 1}`;
    return userAnswer[questionKey]?.map(Number).includes(optionIndex) || false;
  };

  return (
    <div className="mt-4 space-y-6 p-4">
      {loading ? (
        <div className="flex h-screen items-center justify-center">
          <TailSpin
            height="40"
            width="40"
            color="#9b59b6"
            ariaLabel="loading"
          />
        </div>
      ) : (
        <>
          {/* Navigation Buttons */}
          {/* <button
            onClick={() => handleNavigation('prev')}
            className="rounded-full border border-theme p-2 text-purple-500 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
            disabled={currentQuestion === 0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button> */}

          {/* Question Header */}
          <div className="text-center text-lg font-bold">
            Question {currentQuestion + 1} of {totalQuestions}
          </div>

          {/* Question Content */}
          <div className="rounded bg-white p-6 shadow">
            <div className="flex flex-row items-center justify-between">
              <h2 className="mb-4 text-xl font-semibold">
                Question {currentQuestion + 1}
              </h2>
              <h2 className="mb-4 text-xl font-semibold">
                Marks:{' '}
                <span className="mb-4 text-xl font-semibold text-green-500">
                  {marks}
                </span>{' '}
                / {count}
              </h2>
            </div>

            <p className="mb-4">
              This is the question text for question {currentQuestion + 1}.
            </p>

            {/* Options */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <label
                  key={`option-${currentQuestion}-${index}`}
                  className={`flex cursor-pointer items-center rounded p-2 md:flex-row ${
                    isUserAnswer(index)
                      ? isCorrectAnswer(index)
                        ? 'bg-theme text-white' // User-selected and correct
                        : 'bg-theme text-white' // User-selected but incorrect
                      : isCorrectAnswer(index)
                        ? 'bg-gray-100 text-gray-800' // Not selected but correct
                        : 'bg-gray-100' // Not selected and incorrect
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled
                    checked={isUserAnswer(index)}
                    className="mr-2"
                  />
                  <div className="flex flex-row items-center gap-2">
                    Option {index + 1}
                    <img
                      src={
                        isUserAnswer(index)
                          ? isCorrectAnswer(index)
                            ? '/images/icons8-correct.svg' // Correct answer selected
                            : '/images/icons8-wrong.svg' // Incorrect answer selected
                          : isCorrectAnswer(index)
                            ? '/images/icons8-correct.svg' // Correct answer not selected
                            : '/images/icons8-wrong.svg' // Neither selected nor correct
                      }
                      alt={
                        isUserAnswer(index)
                          ? isCorrectAnswer(index)
                            ? 'Correctly Selected'
                            : 'Incorrectly Selected'
                          : isCorrectAnswer(index)
                            ? 'Correct Answer'
                            : 'Neutral'
                      }
                      className="h-4 w-4"
                    />
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-5 text-xs">
              When you choose an answer, press "Next" to go to the next
              question.
            </div>
            <hr className="mt-2 border-gray-400" />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between p-4">
            <button
              className="rounded bg-gray-300 px-4 py-2 text-sm text-gray-700 disabled:opacity-50"
              disabled={currentQuestion === 0}
              onClick={() => handleNavigation('prev')}
            >
              Previous
            </button>

            {currentQuestion < totalQuestions - 1 ? (
              <button
                className="rounded bg-theme px-6 py-2 text-sm text-white disabled:opacity-50"
                onClick={() => handleNavigation('next')}
              >
                Next
              </button>
            ) : (
              <Link to="/exams">
                <button className="rounded bg-theme px-6 py-2 text-sm text-white">
                  Back to Exam Page
                </button>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Answers;
