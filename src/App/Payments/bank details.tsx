// import React from 'react'

import BankdetailsForm from '../../Components/payments/bankdetails';
import Headingbar from '../../Components/headingbar/headingbar';
import ClassHeader from '../../Components/ClassHeaders/page';

function Bankdetails() {
  return (
    <div className="flex flex-col p-2 sm:ml-64">
      <div className="flex flex-col gap-5">
        <Headingbar title="Banks details" />
        <ClassHeader
          sub_text="All the About my performance details you need are listed below."
          main_text="Bank Details"
          icon="images/icons/bank1.png"
        />
      </div>

      <BankdetailsForm />
    </div>
  );
}

export default Bankdetails;
