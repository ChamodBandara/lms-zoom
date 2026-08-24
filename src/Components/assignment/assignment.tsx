import React, { useEffect, useState } from 'react';
import { FileDown, Upload } from 'lucide-react';
import api from '../../services/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TailSpin } from 'react-loader-spinner';
import { defaultConfig } from '../../App/configs/common';
import Countdown from '../../lib/Countdown';
import { Link } from 'react-router-dom';

interface assignmentProps {
  id: string;
  name: string;
  due_date: string;
  due_time: string;
  academic_year: string;
  teacher: string;
  class_avatar: string;
  class_name: string;
  class_teacher: string;
  class_academic_year: string;
  class_class_avatar: string;
  description: string;
  file_path: string;
  is_submitted: boolean;
  recorrection: boolean;
  recorrection_marks: boolean;
  marks: string;
}

interface packdataProps {
  id: string;
  name: string;
  due_date: string;
  due_time: string;
  description: string;
  file_path: string;
  pack_id: string;
  is_submitted: boolean;
  pack: {
    id: string;
    name: string;
    exam_year: string;
    teacher: string;
    pack_avatar: string;
  };
}

const TaskCounter = ({
  total,
  completed,
}: {
  total: number;
  completed: number;
}) => {
  const toDo = total - completed;

  return (
    <div className="flex w-full flex-wrap justify-between rounded-md bg-white p-4 shadow-md">
      <div className="mb-4 flex-1 text-center sm:mb-0 sm:ml-20">
        <span className="text-2xl font-bold">{total}</span>
        <p className="text-sm text-gray-600">Total</p>
      </div>
      <div className="mb-4 flex-1 text-center sm:mb-0">
        <span className="text-2xl font-bold">{completed}</span>
        <p className="text-sm text-gray-600">Completed/Expired</p>
      </div>
      <div className="mb-4 flex-1 text-center sm:mb-0 sm:mr-20">
        <span className="text-2xl font-bold">{toDo}</span>
        <p className="text-sm text-gray-600">To Do</p>
      </div>
    </div>
  );
};

function Assignment() {
  const [removeFileModal, setRemoveFileModal] = useState(false);
  const [recorrectionModal, setRecorrectionModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [file, setFile] = useState<File | null>(null);
  const [file, setFile] = useState<File[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [data, setData] = useState<assignmentProps[]>([]);
  const [packdata, setPackData] = useState<packdataProps[]>([]);
  const [] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [packAssignmentId, setPackAssignmentId] = useState<string | null>(null);
  const [, setSunmission_status] = useState<[]>([]);
  const [totalAssignment, setTotalAssignment] = useState(0);
  const [completeAssignment, setCompleteAssignment] = useState(0);

  const [] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      setFile([...file, ...Array.from(selectedFiles)]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!file.length) return;
    const formData = new FormData();
    file.forEach((file) => formData.append('file[]', file));
    if (assignmentId) {
      formData.append('assignment_id', assignmentId);
    }
    if (packAssignmentId) {
      formData.append('pack_assignment_id', packAssignmentId);
    }

    try {
      const response = await api.post('/uploadassignment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 200) {
        setUploadSuccess(true);
        setFile([]);
      }
      await fetchData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred.');
      }
    }

    setTimeout(() => {
      setUploadSuccess(true);
    }, 1500);
  };

  const handleRemoveSubmission = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setUploadSuccess(false);
    try {
      await api.post('/removeassignment', {
        assignment_id: assignmentId,
      });
      toast.success('Assignment deleted successfully!');
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
    setUploadSuccess(false);
    try {
      await api.post('/assignmentrecorrection', {
        assignment_id: assignmentId,
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

  // Close the modal and reset states
  const handleClose = () => {
    setIsModalOpen(false);
    setUploadSuccess(false);
    setFile([]);
    setFilePreview(null); // Clear the preview
    setAssignmentId(null);
    setPackAssignmentId(null);
  };
  const [isVerificationPopupOpen, setIsVerificationPopupOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/getassignments');
      setData(response.data.data);
      setPackData(response.data.pack_assignments);
      setSunmission_status(response.data.submit_status);
      setTotalAssignment(response.data.data.length);
      // const completedCount = response.data.data.filter(
      //   (assignment: assignmentProps) => assignment.is_submitted,
      // ).length;
      // setCompleteAssignment(completedCount);
      const completedCount = response.data.data.filter(
        (assignment: assignmentProps) =>
          assignment.is_submitted ||
          new Date(`${assignment.due_date}T${assignment.due_time}`) <
            new Date(),
      ).length;

      setCompleteAssignment(completedCount);

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

  return (
    <div className="flex h-full w-full flex-col items-center bg-white p-4">
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
          {/* TaskCounter */}
          <TaskCounter total={totalAssignment} completed={completeAssignment} />
          {/* Cards in one row (3 cards per row) */}
          <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
            {data.map((data) => (
              <div
                className="w-full rounded-lg bg-white p-4 shadow-md"
                key={data.id}
              >
                <img
                  src={`${defaultConfig.BASE_ASSEST_URL}/${data.class_avatar}`}
                  alt={data.name}
                  className="w-full"
                />
                <div className="ml-1 mt-2 flex items-center p-2">
                  <div>
                    <h2 className="line-clamp-2 max-h-16 min-h-16 max-w-64 break-words text-lg font-medium text-gray-800">
                      {data.academic_year} {data.class_name}
                    </h2>
                    <p className="line-clamp-1 max-h-5 min-h-5 w-full max-w-64 truncate text-sm text-gray-600">
                      {data.name}
                    </p>
                    <div className="mt-1 flex items-center">
                      <p className="max-h-5 min-h-5 truncate text-xs text-red-500">
                        {new Date() <
                        new Date(`${data.due_date}T${data.due_time}`) ? (
                          <Countdown
                            targetDate={`${data.due_date}T${data.due_time}`}
                            onComplete={() => {
                              fetchData();
                            }}
                            format="d h m s"
                          />
                        ) : (
                          <span className="text-gray-500">
                            Homework submission is closed.
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="mb-2 mt-1 max-h-5 min-h-5 max-w-64 truncate text-xs capitalize text-gray-600">
                      {data.teacher}
                    </p>
                    {Boolean(data.is_submitted) ? (
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300 sm:mr-2 sm:px-2.5">
                          Submitted
                        </span>
                      </div>
                    ) : (
                      new Date() <
                        new Date(`${data.due_date}T${data.due_time}`) && (
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 sm:mr-2 sm:px-2.5">
                            Pending
                          </span>
                        </div>
                      )
                    )}
                    {/* <p
                      className="mt-2 line-clamp-2 max-h-5 min-h-5 max-w-64 break-words text-xs text-gray-600"
                      dangerouslySetInnerHTML={{ __html: data.description }}
                    ></p> */}

                    <div className="mt-3 flex max-h-2 min-h-2 items-center justify-between rounded-lg">
                      <div className="flex items-center">
                        {/* Conditional rendering based on the assignment status */}
                        {/* {assignmentStatus === "Not Completed" && ( */}
                        {data.marks && (
                          <div className="inline-block rounded border border-green-300 bg-green-100 px-4 py-1 text-[11px] font-bold text-green-600">
                            Homework Marks: <span>{data.marks}</span>
                          </div>
                        )}
                        {/* )} */}
                        {/* {assignmentStatus === "Completed Processing" && (
      <div className="inline-block rounded border border-blue-300 bg-blue-100 px-4 py-2 font-bold text-blue-600 text-[11px]">
        Assignment Marks: <span>Completed Processing</span>
      </div>
    )}
    {assignmentStatus === "Completed" && (
      <div className="inline-block rounded border border-green-300 bg-green-100 px-4 py-2 font-bold text-green-600 text-[11px]">
        Assignment Marks: <span>80</span>
      </div>
    )} */}
                      </div>
                    </div>
                  </div>
                </div>

                {isVerificationPopupOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-80 rounded-lg bg-white p-6 text-center shadow-lg">
                      <h2 className="text-lg font-semibold text-red-600">
                        Verification Required
                      </h2>
                      <p className="mt-2 text-sm text-gray-700">
                        You're not an approved student. Please verify your
                        identity first.
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

                <div className="mt-2 flex flex-wrap justify-start p-3">
                  {!data.is_submitted &&
                    new Date(`${data.due_date}T${data.due_time}`) >=
                      new Date() && (
                      <button
                        onClick={() => {
                          setAssignmentId(data.id);
                          setPackAssignmentId(null);
                          setIsModalOpen(true);
                        }}
                        disabled={
                          new Date(`${data.due_date}T${data.due_time}`) <
                          new Date()
                        }
                        className="mb-2 flex w-full items-center justify-center space-x-2 rounded border border-gray-300 bg-green-500 px-8 py-2 text-sm text-white transition duration-200 hover:bg-green-600 sm:mb-0 sm:w-auto lg:mr-3"
                      >
                        <Upload size={18} />
                        <span className="text-[11px]">Upload</span>
                      </button>
                    )}

                  <div className="flex w-full flex-col space-y-2 sm:w-auto sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
                    {data.is_submitted &&
                      new Date(`${data.due_date}T${data.due_time}`) >=
                        new Date() &&
                      !data.marks && (
                        <button
                          onClick={() => {
                            setRemoveFileModal(true);
                            setAssignmentId(data.id);
                            setPackAssignmentId(null);
                          }}
                          disabled={
                            new Date(`${data.due_date}T${data.due_time}`) <
                              new Date() || !!data.marks
                          }
                          className="flex w-full items-center justify-center space-x-2 rounded bg-red-200 px-2 py-2 text-sm text-red-800 transition duration-200 hover:bg-red-300 disabled:opacity-50 sm:w-auto"
                        >
                          <span className="text-[11px]">Remove Submission</span>
                        </button>
                      )}

                    {data.is_submitted &&
                      data.marks &&
                      !data.recorrection &&
                      !data.recorrection_marks && (
                        <button
                          onClick={() => {
                            setRecorrectionModal(true);
                            setAssignmentId(data.id);
                            setPackAssignmentId(null);
                          }}
                          className="flex w-full items-center justify-center space-x-2 rounded bg-theme px-2 py-2 text-sm text-white transition duration-200 hover:bg-purple-400 disabled:opacity-50 sm:w-auto"
                        >
                          <span className="text-[11px]">
                            Request Recorrection
                          </span>
                        </button>
                      )}

                    <button
                      onClick={() => {
                        const fileUrl = `${defaultConfig.BASE_ASSEST_URL}/${data.file_path}`;
                        const link = document.createElement('a');
                        link.href = fileUrl;
                        link.download = data.name;
                        link.click();
                      }}
                      className="flex w-full items-center justify-center space-x-2 rounded bg-purple-200 px-5 py-2 text-sm text-theme transition duration-200 hover:bg-purple-300 sm:w-auto"
                    >
                      <FileDown size={18} />
                      <span className="text-[11px]">Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {packdata.map((data) => (
              <div
                className="w-full rounded-lg bg-white p-4 shadow-md"
                key={data.id}
              >
                <img
                  src={`${defaultConfig.BASE_ASSEST_URL}/${data.pack.pack_avatar}`}
                  alt={data.name}
                  className="w-full"
                />
                <div className="mt-2 flex items-center p-2">
                  <div>
                    <h2 className="text-lg font-medium text-gray-800">
                      {data.pack.exam_year} {data.pack.name}
                    </h2>
                    <p className="text-sm text-gray-600">{data.name}</p>
                    <div className="mt-1 flex items-center">
                      <p className="text-xs text-gray-600">
                        {data.due_date} {data.due_time}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      {data.pack.teacher}
                    </p>
                    {/* <p className="mt-1 text-xs text-gray-600">
                      {data.description}
                    </p> */}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap justify-center">
                  <button
                    onClick={() => {
                      const fileUrl = `${defaultConfig.BASE_ASSEST_URL}/${data.file_path}`;
                      const link = document.createElement('a');
                      link.href = fileUrl;
                      link.download = data.name;
                      link.click();
                    }}
                    className="mb-2 mr-3 flex w-full items-center justify-center space-x-2 rounded bg-purple-200 px-3 py-1 text-sm text-theme transition duration-200 hover:bg-purple-300 sm:mb-0 sm:w-auto"
                  >
                    <FileDown size={18} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {data.length == 0 && packdata.length == 0 && (
            <div className="flex w-full items-center justify-center">
              <div className="h-screen w-full rounded-lg border border-gray-400 bg-white p-6 text-center shadow-lg">
                <div className="mt-32 flex justify-center">
                  <img
                    src="/images/Animation - 1739266164016.gif"
                    alt=""
                    className="w-40"
                  />
                </div>
                <h2 className="mb-4 text-xl font-semibold text-gray-800">
                  No Homeworks found.
                </h2>
                <p className="text-gray-600">
                  It seems you haven't had any past lessons yet. Check back
                  later!
                </p>
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

          {/* Modal for file upload */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                <h3 className="flex flex-col items-center text-sm font-semibold text-gray-800">
                  {uploadSuccess && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mb-2 h-20 w-20 text-green-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {uploadSuccess ? 'Upload Successful!' : 'Upload File'}
                </h3>

                {!uploadSuccess ? (
                  <div className="mt-4">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      accept=".doc,.docx,.pdf,.jpg,.jpeg"
                      multiple
                    />
                    <span className="text-xs text-gray-500">
                      Acsept Only doc,docx,pdf,xls,xlsx,jpg,jpeg and png
                    </span>
                    {/* Preview the file if it's an image */}
                    {filePreview && (
                      <div className="mt-4">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="h-auto max-h-60 w-full object-cover"
                        />
                      </div>
                    )}
                    {file.length > 0 && (
                      <div className="mt-4 text-sm text-gray-600">
                        <p>Selected Files:</p>
                        <ul className="mt-2 list-disc pl-5">
                          {file.map((f, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between border-b pb-2 pt-2"
                            >
                              <span>{f.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <div className="mt-4 flex space-x-4 text-center">
                        <button
                          onClick={handleClose}
                          className="mb-4 rounded-lg bg-purple-200 px-4 py-2 text-sm text-theme hover:bg-purple-300 sm:mb-0 sm:mr-5"
                        >
                          Close
                        </button>
                        <button
                          onClick={(e) => handleSubmit(e)}
                          className="mb-4 rounded-lg bg-purple-200 px-4 py-2 text-sm text-theme hover:bg-purple-300 sm:mb-0 sm:mr-5"
                          disabled={
                            data.find(
                              (assignment) => assignment.id === assignmentId,
                            )?.marks
                              ? true
                              : false
                          }
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-center">
                    <button
                      onClick={handleClose}
                      className="rounded-lg bg-purple-200 px-4 py-2 text-sm text-theme hover:bg-purple-300"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Modal for delete submission */}
          {removeFileModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                <h3 className="text-center text-lg font-semibold text-gray-800">
                  Are you sure you want to delete the submission?
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
                  Are you sure you want to request a <br />
                  <span className="">recorrection?</span>
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

export default Assignment;
