import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Examtimecountdown from '../../lib/Examtimecountdown';
import { TailSpin } from 'react-loader-spinner';

function ExamPaper() {
  // const [answers, setAnswers] = useState<number[][]>(Array(50).fill([]));
  // const [answers, setAnswers] = useState<number[][] | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: number[] }>({});
  const [maxQuestions, setMaxQuestions] = useState(50);
  const [showTimeUpPopup, setShowTimeUpPopup] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const location = useLocation();
  // const { id, class_id, duration, exam_progress } = location.state || {};
  const { id, class_id, exam_progress } = location.state || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) {
      localStorage.removeItem('examStartTime');
      localStorage.removeItem('examDuration');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        const newTimeLeft = prevTimeLeft - 1;
        localStorage.setItem('timeLeft', String(newTimeLeft));
        return newTimeLeft;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  // const handleOptionSelect = (questionKey: string, optionIndex: number) => {
  //   setAnswers((prev) => {
  //     const newAnswers = { ...prev };
  //     if (!newAnswers[questionKey]) {
  //       newAnswers[questionKey] = [];
  //     }
  //     if (newAnswers[questionKey].includes(optionIndex)) {
  //       newAnswers[questionKey] = newAnswers[questionKey].filter(
  //         (opt) => opt !== optionIndex,
  //       );
  //     } else if (newAnswers[questionKey].length < 5) {
  //       newAnswers[questionKey] = [...newAnswers[questionKey], optionIndex];
  //     }
  //     return newAnswers;
  //   });
  // };
  const handleOptionSelect = (questionKey: string, optionIndex: number) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      newAnswers[questionKey] = [optionIndex];
      return newAnswers;
    });
  };

  const submitAnswers = async () => {
    if (!answers) return;
    const payload = { answer: answers, exam_id: id, class_id: class_id };
    try {
      const response = await api.post('/submitanswer', payload);
      setMaxQuestions(response.data.count || 50);
      if (response.data.success === false && response.data.submitted) {
        toast.error(response.data.message);
        navigate('/exams');
      }
      if (response.data.success === true && response.data.submitted) {
        toast.success('Exam Submitted Successfully');
        navigate('/exams');
      }
      if (response.data.success === false && response.data.time_expired) {
        toast.error(response.data.message);
        navigate('/exams');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // const handleNavigation = useCallback(
  //   (direction: 'prev' | 'next') => {
  //     setCurrentQuestion((prev) => {
  //       if (direction === 'prev') return Math.max(1, prev - 1);
  //       if (direction === 'next') return Math.min(maxQuestions, prev + 1);
  //       return prev;
  //     });

  //     submitAnswers();
  //   },
  //   [submitAnswers, maxQuestions],
  // );
  const handleNavigation = useCallback(
    (direction: 'prev' | 'next') => {
      const questionKey = `Q${currentQuestion}`;

      if (direction === 'next') {
        const currentAnswer = answers[questionKey];
        if (!currentAnswer || currentAnswer.length === 0) {
          toast.info('Please select an option before proceeding.');
          return;
        }
      }

      setCurrentQuestion((prev) => {
        if (direction === 'prev') return Math.max(1, prev - 1);
        if (direction === 'next') return Math.min(maxQuestions, prev + 1);
        return prev;
      });
      submitAnswers();
    },
    [submitAnswers, maxQuestions, answers, currentQuestion],
  );

  const handleSubmit = () => {
    const lastQuestionKey = `Q${maxQuestions}`;
    if (!answers[lastQuestionKey] || answers[lastQuestionKey].length === 0) {
      toast.info(
        'Please select an answer for the last question before submitting.',
      );
      return;
    }
    setShowConfirmDialog(true);
  };

  const calculateEndTime = () => {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  };

  const confirmSubmission = async (confirm: boolean) => {
    if (!confirm) {
      setShowConfirmDialog(false);
      return;
    }
    setShowConfirmDialog(false);
    setIsLoading(true);
    const response = await api.post('/submitexam', {
      exam_id: id,
      class_id: class_id,
      end_time: calculateEndTime(),
    });
    if (response.data.success) {
      toast.success('Exam Submitted Successfully');
      setIsSubmitted(true);
      setTimeout(() => {
        navigate('/exams');
      }, 2000);
    } else {
      toast.error('Submission failed. Please try again.');
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/getanswers', {
        exam_id: id,
        class_id: class_id,
      });

      if (response.data.success) {
        const parsedAnswers = response.data.answers[0]?.answer
          ? JSON.parse(response.data.answers[0].answer)
          : {};
        setAnswers(parsedAnswers);
        setMaxQuestions(response.data.count || 50);
      } else {
        const defaultAnswers: { [key: string]: number[] } = {};
        for (let i = 1; i <= 50; i++) {
          defaultAnswers[`Q${i}`] = [];
        }
        setAnswers(defaultAnswers);
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (showTimeUpPopup) {
      setTimeout(() => {
        navigate('/exams');
      }, 5000);
    }
  }, [showTimeUpPopup, navigate]);

  const currentQuestionKey = `Q${currentQuestion}`;
  return (
    <div className="mt-4 space-y-6 p-4">
      {isLoading ? (
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
          <button
            onClick={() => handleNavigation('prev')}
            className="rounded-full border border-theme p-2 text-purple-500 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
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
          </button>
          {!isSubmitted && (
            <div className="flex flex-row gap-2 rounded bg-gray-100 p-3 text-left text-lg font-bold shadow">
              Time Left:
              <span className="text-red-500">
                <Examtimecountdown
                  examProgress={exam_progress}
                  // duration={duration}
                  onComplete={async () => {
                    setShowTimeUpPopup(true);
                    if (!isSubmitted) {
                      submitAnswers();
                      await confirmSubmission(true);
                    }
                  }}
                />
              </span>
            </div>
          )}

          {!isSubmitted && (
            <div className="text-center text-lg font-bold">
              {/* Question {currentQuestion} of 50 Question  */}
              {currentQuestion} of {maxQuestions}
            </div>
          )}

          {!isSubmitted && (
            <div className="rounded bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">
                Question {currentQuestion}
              </h2>
              {/* <p className="mb-4">
                This is the question text for question {currentQuestion}.
              </p> */}

              <div className="grid gap-4 md:grid-cols-2 md:gap-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <label
                    key={index}
                    className={`flex cursor-pointer items-center rounded border p-2 md:flex-row ${
                      answers[currentQuestionKey]?.includes(index)
                        ? 'bg-theme text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={
                        answers[currentQuestionKey]?.includes(index) || false
                      }
                      onChange={() =>
                        handleOptionSelect(currentQuestionKey, index)
                      }
                    />
                    Option {index + 1}
                  </label>
                ))}
              </div>

              <div className="mt-5 text-xs">
                When you choose answer press next to Answer Next Question
              </div>
              <hr className="mt-2 border-gray-400" />
            </div>
          )}

          {!isSubmitted && (
            <div className="flex justify-between p-4">
              <button
                className="rounded bg-gray-300 px-4 py-2 text-sm text-gray-700 disabled:opacity-50"
                disabled={currentQuestion === 1}
                onClick={() => handleNavigation('prev')}
              >
                Previous
              </button>
              {currentQuestion < maxQuestions ? (
                <button
                  className="rounded bg-theme px-6 py-2 text-sm text-white"
                  onClick={() => handleNavigation('next')}
                >
                  Next
                </button>
              ) : (
                <button
                  className="rounded bg-theme px-6 py-3 text-sm text-white"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              )}
            </div>
          )}
          {showConfirmDialog && (
            <div className="fixed inset-0 flex h-full items-center justify-center bg-black bg-opacity-50">
              <div className="space-y-4 rounded bg-white p-6 text-center shadow-lg">
                <h3 className="text-lg font-bold">Confirm Submission</h3>
                <p>Are you sure you want to submit your answers?</p>
                <div className="flex justify-center space-x-4">
                  <button
                    className="rounded bg-theme px-4 py-2 text-sm text-white"
                    onClick={async () => {
                      setIsLoading(true);
                      await submitAnswers();
                      confirmSubmission(true);
                      setIsLoading(false);
                    }}
                  >
                    Yes
                  </button>
                  <button
                    className="rounded bg-gray-400 px-4 py-2 text-sm text-white"
                    onClick={() => confirmSubmission(false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
          {isSubmitted && (
            <div className="flex h-96 flex-col items-center justify-center space-y-4 bg-gray-100 text-center">
              <img
                src="images/icons8-success-96.png"
                alt="Success Icon"
                className="h-16 w-auto"
              />
              <h2 className="text-2xl font-bold">Exam Submitted!</h2>
              <p className="text-lg">
                Thank you for completing the exam. Your answers have been
                submitted.
              </p>

              <button
                onClick={() =>
                  navigate('/exam-paper', {
                    state: { id: id, class_id: class_id },
                  })
                }
                className="rounded-lg bg-theme px-6 py-3 text-white shadow-md hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                View Results
              </button>
            </div>
          )}
          {showTimeUpPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="rounded-lg bg-white p-6 text-center shadow-lg">
                <h2 className="text-xl font-bold text-red-500">Time's Up!</h2>
                <p className="mt-2 text-gray-700">
                  The exam time has ended. You will be redirected shortly.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ExamPaper;
