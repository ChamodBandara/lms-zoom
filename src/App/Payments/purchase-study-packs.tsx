// import React from 'react'
import DashboardLayout from '../../Components/DashboardLayout/DashboardLayout';
import PurchaseStudyPack from '../../Components/payments/purchase-study';

function PurchaseStudy() {
  return (
    <DashboardLayout>
      <div className="flex flex-col p-2 sm:ml-64">
        <PurchaseStudyPack />
      </div>
    </DashboardLayout>
  );
}

export default PurchaseStudy;
