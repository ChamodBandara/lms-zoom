import Headingbar from '../../Components/headingbar/headingbar';
import SinglePack from '../../Components/discussions/discussions';

function SinglePackPage() {
  return (
     <div className="flex flex-col p-2 ">
      <div className="flex flex-col gap-5 ">
        <Headingbar title="Study Packs" />
      </div>
      <SinglePack />
    </div>
  );
}

export default SinglePackPage;
