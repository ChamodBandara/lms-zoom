import ClassHeader from '../../Components/ClassHeaders/page';
import Headingbar from '../../Components/headingbar/headingbar';
//import Semina from '../../Components/Temp/semin';
import SeminaEnroll from '../../Components/semina/seminaenroll';

function SeminaPage() {
  return (
    <div className="flex flex-col p-2 sm:ml-64">
      <div className="flex flex-col gap-5">
        <Headingbar title="Seminar" />
        <ClassHeader
              sub_text="All the About Seminar Enroll details you need are listed below."
              main_text="Seminar Enroll"
              icon="/images/dashicons_awards.png"
            />
  
        
      </div>
      

      <SeminaEnroll />
      {/* <Semina /> */}
    </div>
  );
}

export default SeminaPage;
