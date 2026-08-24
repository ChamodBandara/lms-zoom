import { ArrowBigRight, FileDown, FileUp, SpellCheck } from 'lucide-react';

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import Countdown from '../../lib/Countdown';
import { TailSpin } from 'react-loader-spinner';
import { defaultConfig } from '../../App/configs/common';

interface ExamData {
  id: number;
  name: string;
  start_time: string;
  due_date: string;
  due_time: string;
  class_id: number;
  exam_id: number;
  teacher: string;
  duration: number;
  submitted_status: boolean;
  exam_progress: string;
  type: string;
  exam_pdf: string;
  structure_marks: number;
  class: {
    name: string;
  };
  structure_marks_recorrection: boolean;
  file_submitted: boolean;
}

function ExamList() {
  const [exam_data, setExam_Data] = useState<ExamData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamData | null>(null);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [totalExams, setTotalExams] = useState(0);
  const [completedExams, setCompletedExams] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [currentExam, setCurrentExam] = useState<ExamData | null>(null);
  const [removeFileModal, setRemoveFileModal] = useState(false);
  const [examId, setExamId] = useState<number | null>(null);
  const [recorrectionModal, setRecorrectionModal] = useState(false);

  const remainingExams = totalExams - completedExams;
  const completionPercentage =
    totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0;

  const handleUploadClick = (exam: ExamData) => {
    setCurrentExam(exam);
    setShowModal(true);
  };
  const handleStartClik = (exam: ExamData) => {
    setShowStartModal(true);
    setSelectedExam(exam);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setShowStartModal(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleExamStart = async ({
    exam_id,
    class_id,
    duration,
    exam_progress,
  }: {
    exam_id: number;
    class_id: number;
    duration: number;
    exam_progress: string;
  }) => {
    const response = await api.post('/startexam', {
      exam_id: exam_id,
      class_id: class_id,
      duration: duration,
      exam_progress: exam_progress,
    });
    if (response.status === 400) {
      const { existingExam } = response.data;
      navigate(`/exams-mcq`, {
        state: {
          id: existingExam.exam_id,
          class_id: existingExam.class_id,
          duration: existingExam.duration,
          exam_progress: existingExam.exam_progress,
        },
      });
    } else if (response.status === 200) {
      toast.success('Exam started successfully!');
      navigate(`/exams-mcq`, {
        state: {
          id: exam_id,
          class_id: class_id,
          duration: duration,
          exam_progress: response.data.exam_progress,
        },
      });
    } else {
      toast.error('Failed to start the exam.');
    }
  };

  const displyAnswers = async ({
    exam_id,
    class_id,
    duration,
    exam_progress,
  }: {
    exam_id: number;
    class_id: number;
    duration: number;
    exam_progress: string;
  }) => {
    navigate(`/answers`, {
      state: {
        id: exam_id,
        class_id: class_id,
        duration: duration,
        exam_progress: exam_progress,
      },
    });
  };
  const [isVerificationPopupOpen, setIsVerificationPopupOpen] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!files.length || !currentExam) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('file[]', file);
    });
    formData.append('exam_id', currentExam.id.toString());
    formData.append('class_id', currentExam.class_id.toString());

    try {
      const response = await api.post('/submitstructureanswers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        toast.success('File uploaded successfully');
        setFiles([]);
        setShowModal(false);
        await fetchData();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Upload failed');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  const handleRemoveSubmission = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);

    try {
      await api.post('/removesubmitstructureanswers', {
        exam_id: examId,
      });
      toast.success('File deleted successfully!');
      await fetchData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecorrction = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);

    try {
      await api.post('/requestrecorrectionexams', {
        exam_id: examId,
      });
      toast.success('Request sent successfully!');
      await fetchData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleautosubmisson = async (examId: number, classId: number) => {
    try {
      const response = await api.post('/autosubmitstuctureexams', {
        exam_id: examId,
        class_id: classId,
      });
      if (response.status === 200) {
        toast.success(response.data.message);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Upload failed');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/getallexams');
      setExam_Data(response.data.result);
      setTotalExams(response.data.result.length);
      setCompletedExams(
        response.data.result.filter(
          (item: ExamData) => item.submitted_status !== false,
        ).length,
      );

      if (response.data?.isUserstatus !== 'approved') {
        setIsVerificationPopupOpen(true);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setExam_Data([...exam_data]);
    }, 60000);
    return () => clearInterval(interval);
  }, [exam_data]);

  const getCountdownTarget = (data: ExamData) => {
    const now = new Date();
    const startTime = new Date(data.start_time.replace(' ', 'T'));
    const dueTime = new Date(`${data.due_date}T${data.due_time}`);

    return now < startTime ? startTime : dueTime;
  };

  return (
    <div className="w-full rounded-lg bg-white p-6 shadow-md">
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
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="md:w-1/2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800"> Exams</h2>
                <span className="text-sm text-gray-600">
                  {completionPercentage}%
                </span>
              </div>
              <div className="mb-6 h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="ml-5 md:w-1/3">
              <div className="flex items-center justify-between space-x-4 md:space-y-0">
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-800">
                    {totalExams}
                  </span>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-800">
                    {completedExams}
                  </span>
                  <p className="text-sm text-gray-600">Completed/Expired</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-800">
                    {remainingExams}
                  </span>
                  <p className="text-sm text-gray-600">To Do</p>
                </div>
              </div>
            </div>
          </div>
          {exam_data.length == 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold"> MCQ</h2>
              <div className="flex h-full flex-col items-center justify-center">
                <img src="/images/exam.jpg" alt="" className="w-96" />
                <p className="mt-2text-sm text-gray-600">No exams found.</p>
              </div>
            </div>
          )}

          {isVerificationPopupOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-80 rounded-lg bg-white p-6 text-center shadow-lg">
                <h2 className="text-lg font-semibold text-red-600">
                  Verification Required
                </h2>
                <p className="mt-2 text-sm text-gray-700">
                  You're not an approved student. Please verify your identity
                  first.
                </p>
                <div className="mt-4 flex justify-center gap-4">
                  <Link to={`/profile`}>
                    <button className="mt-4 rounded-lg bg-theme px-4 py-2 text-sm text-white hover:bg-purple-900">
                      Verify
                    </button>
                  </Link>
                  {/* <button
                      className="mt-4 rounded-lg bg-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-400"
                      onClick={() => setIsVerificationPopupOpen(false)}
                    >
                      Close
                    </button> */}
                </div>
              </div>
            </div>
          )}

          {exam_data
            .filter((data) => data.type === 'mcq')
            .map((data, index) => (
              <React.Fragment key={data.id || index}>
                {index === 0 && (
                  <h2 className="mt-6 text-lg font-medium text-gray-800">
                    MCQ Exams
                  </h2>
                )}
                <div
                  key={data.id}
                  className="mt-3 rounded-lg border border-gray-400 bg-white p-4 shadow-xl sm:p-8"
                >
                  <h2 className="mb-2 text-xl font-semibold capitalize">
                    {data.name}
                  </h2>
                  <span className="mb-4 text-sm text-gray-600">
                    {data.class.name}
                  </span>
                  <div className="mb-4 text-sm text-gray-600">
                    <p>Start date and time: {data.start_time?.slice(0, 16)}</p>
                    <p>
                      Due date and time: {data.due_date}{' '}
                      {data.due_time?.slice(0, 5)}
                    </p>
                    <p>By {data.teacher}</p>
                    {new Date(`${data.due_date}T${data.due_time}`) <
                      new Date() && (
                      <p className="mt-3 text-red-500">Exam is over</p>
                    )}

                    {new Date() <
                    new Date(data.start_time.replace(' ', 'T')) ? (
                      <p className="mt-3">
                        The exam has not started yet. Please wait until the
                        start time.
                      </p>
                    ) : new Date() <
                      new Date(`${data.due_date}T${data.due_time}`) ? (
                      <p className="mt-3 text-red-500">
                        Please complete your exam before the below time.
                      </p>
                    ) : (
                      <p className="mt-3 text-gray-500"></p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {new Date() <
                      new Date(`${data.due_date}T${data.due_time}`) && (
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          // className="mr-2 h-6 w-6 text-red-500"
                          className={`mr-2 h-6 w-6 ${
                            new Date() >=
                            new Date(data.start_time.replace(' ', 'T'))
                              ? 'text-red-500'
                              : 'text-green-500'
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>

                        <span
                          className={`mr-2 text-sm font-bold lg:mr-0 lg:text-xl ${
                            new Date() >=
                            new Date(data.start_time.replace(' ', 'T'))
                              ? 'text-red-500'
                              : 'text-green-500'
                          }`}
                        >
                          <Countdown
                            // targetDate={data.due_date}
                            // targetDate={`${data.due_date}T${data.due_time}`}
                            targetDate={getCountdownTarget(data).toString()}
                            onComplete={
                              () => {
                                if (
                                  !data.submitted_status &&
                                  new Date(
                                    `${data.due_date}T${data.due_time}`,
                                  ) <= new Date()
                                ) {
                                  handleautosubmisson(data.id, data.class_id);
                                }
                                fetchData();
                              }
                              // toast.info(`${data.name}, the exam period has expired.`)
                            }
                            format="d h m s"
                          />
                        </span>
                      </div>
                    )}

                    <div className="flex flex-row gap-2">
                      {!data?.submitted_status &&
                        new Date() >=
                          new Date(data.start_time.replace(' ', 'T')) &&
                        new Date() <
                          new Date(`${data.due_date}T${data.due_time}`) && (
                          <button
                            className={`flex items-center rounded bg-gray-800 px-6 py-1 font-bold text-white hover:bg-gray-900 ${data?.submitted_status ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            onClick={() => handleStartClik(data)}
                            disabled={
                              new Date(`${data.due_date}T${data.due_time}`) <
                                new Date() || Boolean(data?.submitted_status)
                            }
                          >
                            {data?.submitted_status
                              ? 'Submitted'
                              : data?.exam_progress
                                ? 'Ongoing'
                                : 'Start'}

                            <ArrowBigRight
                              size={18}
                              fill="#fff"
                              className="ml-2"
                            />
                          </button>
                        )}
                      {Boolean(data?.submitted_status) && (
                        <button
                          className="flex items-center rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-gray-900"
                          onClick={() =>
                            displyAnswers({
                              exam_id: data.id,
                              class_id: data.class_id,
                              duration: data.duration,
                              exam_progress: data.exam_progress,
                            })
                          }
                        >
                          View Answers
                          <ArrowBigRight
                            size={18}
                            fill="#fff"
                            className="ml-2"
                          />
                        </button>
                      )}
                      {data?.exam_pdf &&
                        new Date() >=
                          new Date(data.start_time.replace(' ', 'T')) &&
                        new Date() <
                          new Date(`${data.due_date}T${data.due_time}`) && (
                          <button
                            onClick={() => {
                              const fileUrl = `${defaultConfig.BASE_ASSEST_URL}/${data.exam_pdf}`;
                              const link = document.createElement('a');
                              link.href = fileUrl;
                              link.download = data.name || 'download';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="mb-2 mr-3 flex w-full items-center justify-center space-x-2 rounded bg-purple-200 px-3 py-2 text-sm text-theme transition duration-200 hover:bg-purple-300 sm:mb-0 sm:w-auto"
                          >
                            <FileDown size={18} />
                            <span>Download</span>
                          </button>
                        )}
                    </div>

                    {/* Modal for Start */}

                    {showStartModal && selectedExam && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="relative rounded-lg bg-white p-8 shadow-lg">
                          <h2 className="text-xl font-bold">
                            {data.exam_progress
                              ? 'Are you sure you want to continue the exam?'
                              : 'Are you sure you want to start the exam?'}
                          </h2>
                          <div className="mt-4 flex justify-center space-x-4">
                            <button
                              className="rounded bg-theme px-4 py-2 text-white hover:bg-green-600"
                              onClick={() => {
                                handleExamStart({
                                  exam_id: selectedExam.id,
                                  class_id: selectedExam.class_id,
                                  duration: selectedExam.duration,
                                  exam_progress: selectedExam.exam_progress,
                                });
                                handleCloseModal();
                              }}
                            >
                              {data.exam_progress ? 'Continue' : 'Start'}
                            </button>
                            <button
                              onClick={handleCloseModal}
                              className="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))}

          {exam_data
            .filter((data) => data.type === 'structure')
            .map((data, index) => (
              <React.Fragment key={data.id || index}>
                {index === 0 && (
                  <h2 className="mt-6 text-lg font-medium text-gray-800">
                    Structure Exams
                  </h2>
                )}
                <div className="mt-3 rounded-lg border border-gray-400 bg-white p-4 shadow-xl sm:p-8">
                  <div className="mb-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex-1">
                        <h2 className="mb-2 text-xl font-semibold capitalize">
                          {data.name}
                        </h2>
                        <p className="text-xs text-gray-600 sm:text-sm">
                          {data.class?.name}
                        </p>
                      </div>
                      {Boolean(data.submitted_status) &&
                        Boolean(data.file_submitted) && (
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300 sm:mr-2 sm:px-2.5">
                              Submitted
                            </span>
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 sm:h-8 sm:w-8">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-white sm:h-5 sm:w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                    </div>
                    <p className="mt-0 text-xs text-gray-600 sm:text-sm">
                      Start date and time: {data.start_time?.slice(0, 16)}
                    </p>
                    <p className="text-xs text-gray-600 sm:text-sm">
                      <p>
                        Due date and time: {data.due_date}{' '}
                        {data.due_time?.slice(0, 5)}
                      </p>
                    </p>
                    <p className="text-xs text-gray-600 sm:text-sm">
                      By {data.teacher}
                    </p>
                    {data.structure_marks && (
                      <p className="text-xs text-gray-600 sm:text-sm">
                        Marks : {data.structure_marks}
                      </p>
                    )}

                    {new Date(`${data.due_date}T${data.due_time}`) <
                      new Date() && (
                      <p className="mt-3 text-sm text-red-500">Exam is over</p>
                    )}
                    {new Date() <
                    new Date(data.start_time.replace(' ', 'T')) ? (
                      <p className="mt-3 text-sm">
                        The exam has not started yet. Please wait until the
                        start time.
                      </p>
                    ) : new Date() <
                      new Date(`${data.due_date}T${data.due_time}`) ? (
                      <p className="mt-3 text-sm text-red-500">
                        Please complete your exam before the below time.
                      </p>
                    ) : (
                      <p className="mt-3 text-sm text-gray-500"></p>
                    )}
                    <div className="flex flex-row items-center justify-between">
                      {new Date() <
                        new Date(`${data.due_date}T${data.due_time}`) && (
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            // className="mr-2 h-6 w-6 text-red-500"
                            className={`mr-2 h-6 w-6 ${
                              new Date() >=
                              new Date(data.start_time.replace(' ', 'T'))
                                ? 'text-red-500'
                                : 'text-green-500'
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>

                          <span
                            className={`mr-2 text-sm font-bold lg:mr-0 lg:text-xl ${
                              new Date() >=
                              new Date(data.start_time.replace(' ', 'T'))
                                ? 'text-red-500'
                                : 'text-green-500'
                            }`}
                          >
                            <Countdown
                              targetDate={getCountdownTarget(data).toString()}
                              onComplete={() => {
                                if (
                                  !data.submitted_status &&
                                  new Date(
                                    `${data.due_date}T${data.due_time}`,
                                  ) <= new Date()
                                ) {
                                  handleautosubmisson(data.id, data.class_id);
                                }
                                fetchData();
                              }}
                              format="d h m s"
                            />
                          </span>
                        </div>
                      )}
                      {/* buttons */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          {Boolean(data.submitted_status) &&
                            Boolean(!data.structure_marks_recorrection) &&
                            data.structure_marks &&
                            new Date(`${data.due_date}T${data.due_time}`) <=
                              new Date() && (
                              <button
                                className="flex items-center justify-center space-x-2 rounded bg-theme px-3 py-2 text-xs font-bold text-white hover:bg-purple-400 sm:w-auto sm:px-4 sm:py-2"
                                onClick={() => {
                                  setRecorrectionModal(true);
                                  setExamId(data.id);
                                }}
                              >
                                <SpellCheck />
                                <span>Recorrection</span>
                              </button>
                            )}
                        </div>

                        {Boolean(data.submitted_status) &&
                          new Date(`${data.due_date}T${data.due_time}`) >=
                            new Date() &&
                          !data.structure_marks && (
                            <button
                              onClick={() => {
                                setRemoveFileModal(true);
                                setExamId(data.id);
                              }}
                              disabled={
                                new Date(`${data.due_date}T${data.due_time}`) <
                                  new Date() || !!data.structure_marks
                              }
                              className="flex w-full items-center justify-center space-x-2 rounded bg-red-200 px-2 py-2 text-sm text-red-800 transition duration-200 hover:bg-red-300 disabled:opacity-50 sm:w-auto"
                            >
                              <span className="text-[11px]">
                                Remove Submission
                              </span>
                            </button>
                          )}

                        {Boolean(!data.submitted_status) &&
                          new Date() >=
                            new Date(data.start_time.replace(' ', 'T')) &&
                          new Date() <
                            new Date(`${data.due_date}T${data.due_time}`) && (
                            <button
                              onClick={() => handleUploadClick(data)}
                              className="flex w-full items-center justify-center space-x-2 rounded bg-green-500 px-4 py-2 font-light text-white hover:bg-green-700 sm:w-auto sm:px-4 sm:py-2 lg:px-5 lg:text-xs lg:font-bold"
                            >
                              <span className="ml-1 mr-2 text-sm">Upload</span>
                              <FileUp size={18} />
                            </button>
                          )}
                        {data?.exam_pdf &&
                          new Date() >=
                            new Date(data.start_time.replace(' ', 'T')) &&
                          new Date() <
                            new Date(`${data.due_date}T${data.due_time}`) && (
                            <button
                              onClick={() => {
                                const fileUrl = `${defaultConfig.BASE_ASSEST_URL}/${data.exam_pdf}`;
                                const link = document.createElement('a');
                                link.href = fileUrl;
                                link.download = data.name || 'download';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="flex items-center justify-center space-x-2 rounded bg-purple-200 px-3 py-2 text-sm text-theme transition duration-200 hover:bg-purple-300 sm:w-auto"
                            >
                              <FileDown size={18} />
                              <span>Download</span>
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}

          {/* Modal for Upload */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="relative rounded-lg bg-white p-8 shadow-lg">
                <h2 className="text-xl font-bold">Upload Answers</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="mt-4"
                    onChange={handleFileChange}
                    multiple // Allow multiple file selection
                    required
                  />
                  {files.length > 0 && (
                    <div className="mt-4 rounded-lg bg-gray-100 p-4">
                      <p className="text-gray-700">Selected files:</p>
                      <ul className="max-h-40 overflow-y-auto">
                        {files.map((file, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between py-1"
                          >
                            <span className="truncate text-sm text-gray-500">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setFiles(files.filter((_, i) => i !== index))
                              }
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setFiles([]);
                      }}
                      className="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-theme px-4 py-2 text-white hover:bg-green-600"
                      disabled={!files.length}
                    >
                      Submit {files.length > 0 && `(${files.length})`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Modal for delete submission */}
          {removeFileModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                <h3 className="text-center text-lg font-semibold text-gray-800">
                  Are you sure to delete the submission
                </h3>

                <div className="mt-6 flex justify-center space-x-4">
                  {/* Cancel Button */}
                  <button
                    onClick={() => {
                      setRemoveFileModal(false);
                    }}
                    className="rounded-lg bg-gray-300 px-4 py-2 text-sm text-gray-800 hover:bg-gray-400"
                  >
                    No
                  </button>

                  {/* Confirm Removal Button */}
                  <button
                    onClick={() => {
                      handleRemoveSubmission();
                      setRemoveFileModal(false);
                    }}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                  >
                    {loading ? 'Removing' : 'Yes'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Modal for Request recorrection */}
          {recorrectionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                <h3 className="text-center text-lg font-semibold text-gray-800">
                  Are you sure you want to request a recorrection?
                </h3>

                <div className="mt-6 flex justify-center space-x-4">
                  {/* Cancel Button */}
                  <button
                    onClick={() => {
                      setRecorrectionModal(false);
                    }}
                    className="rounded-lg bg-gray-300 px-4 py-2 text-sm text-gray-800 hover:bg-gray-400"
                  >
                    No
                  </button>

                  {/* Confirm Removal Button */}
                  <button
                    onClick={() => {
                      handleRecorrction();
                      setRecorrectionModal(false);
                    }}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                  >
                    {loading ? 'Requesting' : 'Yes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ExamList;
