// import { pastClass } from '../../../assests';
// import ClassHeader from '../../../Components/ClassHeaders/page';
// import { ButtonType } from '../../../Components/CourseCard/page';
// import CourseCard from '../../../Components/CourseCard/page';

// import Filters from '../../../Components/Filters/page';
import Headingbar from '../../../Components/headingbar/headingbar';
import PastLesson from '../../../Components/Temp/pastlesson';

const PastClass = () => {
  return (
    <div className="flex flex-col p-2 sm:ml-64">
      <div className="flex flex-col gap-5">
        <Headingbar title="Past Lessons" />
        {/* <ClassHeader
          sub_text="The Past Lessons available to you are listed below."
          main_text="Past Lessons"
          icon="/images/icons/past.png"
        /> */}
        {/* <div className="bg-white p-4">
          <div className="flex flex-col gap-3">
            <Filters onFiltersChange={function (): void {
              throw new Error('Function not implemented.');
            } } />
            <hr className="border-gray-200 w-full" />
            <div className="mt-2 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
              {pastClass.map((course, index) => (
                <CourseCard
                  key={index}
                  class_avatar={course.class_avatar}
                  name={course.name}
                  description={course.description}
                  teacher={course.teacher}
                  avatar={course.avatar}
                  buttonType={ButtonType.PAST}
                  price={course.price} id={''}                />
              ))}

             
            </div>
          </div>
        </div> */}

        <PastLesson />
      </div>
    </div>
  );
};

export default PastClass;
