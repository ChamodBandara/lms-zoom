// import ExamList from "../../Components/Exams/exam"

import ExamList from '../../Components/Exams/exam';
import Headingbar from '../../Components/headingbar/headingbar';
// import ExamComming from '../../Components/Temp/exam';

function ExamPage() {
  return (
    <div className="flex flex-col p-2 sm:ml-64">
      <div className="flex flex-col gap-5">
        <Headingbar title="Exams" />
      </div>

      <ExamList />

      {/* <ExamComming /> */}
    </div>
  );
}

export default ExamPage;
