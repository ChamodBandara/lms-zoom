import Headingbar from '../../../Components/headingbar/headingbar';

import SingleSemina from '../semina-single-page/singlesemina';

export default function SingleSeminaPage() {
  return (
    <div>
      <div className="flex flex-col p-2 sm:ml-64">
        <div className="flex flex-col gap-5">
          <Headingbar title="Seminar info" />
        </div>
        <SingleSemina />
      </div>
    </div>
  );
}
