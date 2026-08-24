import Headingbar from '../../../Components/headingbar/headingbar';
import SingleClass from '../../../Components/singleClass/singleclass';

function SingleClassPage() {
  return (
    <div className="flex flex-col p-2">
      <div className="flex flex-col gap-5">
        <Headingbar title="" />
      </div>
      <SingleClass />
    </div>
  );
}

export default SingleClassPage;
