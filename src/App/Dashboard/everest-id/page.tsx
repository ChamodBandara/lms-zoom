// import React from 'react'

import Headingbar from '../../../Components/headingbar/headingbar';
import EverestId from '../../../Components/everest-id/everest-id';

function EverestIdPage() {
  return (
    <div className="flex flex-col p-2 sm:ml-64">
      <div className="flex flex-col gap-5">
        <Headingbar title="Everest ID" />
      </div>

      <EverestId />
    </div>
  );
}

export default EverestIdPage;
