import ExamPaper from "../../../Components/Exams/exam-paper"
import Headingbar from "../../../Components/headingbar/headingbar"


function McqPage() {
  return (
    <div className="flex flex-col p-2 sm:ml-64">
    <div className="flex flex-col gap-5">
        <Headingbar title="MCQ" />
       
      </div>
      <div className="bg-white mt-2">
      <ExamPaper />

      </div>
   
     

    
    </div>
  )
}

export default McqPage