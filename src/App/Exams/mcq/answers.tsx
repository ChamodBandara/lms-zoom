import Answers from "../../../Components/Exams/answers"

import Headingbar from "../../../Components/headingbar/headingbar"


function AnswersSheet() {
  return (
    <div className="flex flex-col p-2 sm:ml-64">
    <div className="flex flex-col gap-5">
        <Headingbar title="MCQ answers" />
       
      </div>

      <div className="bg-white mt-2">

      <Answers />

        </div>
     
   

    
    </div>
  )
}

export default AnswersSheet