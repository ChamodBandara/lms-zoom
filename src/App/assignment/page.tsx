// import Assignment from "../../Components/assignment/assignment"
// import ClassHeader from '../../Components/ClassHeaders/page';
import Assignment from '../../Components/assignment/assignment';
import ClassHeader from '../../Components/ClassHeaders/page';
import Headingbar from '../../Components/headingbar/headingbar';
// import AssignmentComing from '../../Components/Temp/assignments';

function AssignmentPage() {
  return (
    <div className="flex flex-col p-2 md:ml-64 lg:ml-64">
      <div className="flex flex-col gap-5">
        <Headingbar title="HOMEWORKS" />
        <ClassHeader
          sub_text="All the homeworks available to you are listed below."
          main_text="All Homeworks"
          icon="/images/dashicons_awards.png"
        />
      </div>

      <Assignment />

      {/* <AssignmentComing /> */}
    </div>
  );
}

export default AssignmentPage;
