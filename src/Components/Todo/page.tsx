import { useState } from 'react';
import ExamList from '../Exams/exam';
import Assignment from '../assignment/assignment';

function TodoPage() {
    const [activeTab, setActiveTab] = useState<'exams' | 'homeworks'>('exams');

    return (
        <div className="w-full">
            
            <div className="mb-6 flex w-full rounded-lg bg-gray-100 p-1">
                <button
                    onClick={() => setActiveTab('exams')}
                    className={`flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors ${activeTab === 'exams'
                            ? 'bg-theme text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Exams
                </button>
                <button
                    onClick={() => setActiveTab('homeworks')}
                    className={`flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors ${activeTab === 'homeworks'
                            ? 'bg-theme text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Homeworks
                </button>
            </div>

           
            {activeTab === 'exams' ? (
                <div className="animate-fadeIn">
                    <ExamList />
                </div>
            ) : (
                <div className="animate-fadeIn">
                    <Assignment />
                </div>
            )}
        </div>
    );
}

export default TodoPage;
