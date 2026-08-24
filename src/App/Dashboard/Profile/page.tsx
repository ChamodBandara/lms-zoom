// import React from 'react';

import MyProfile from '../../../Components/profile/myprofile';
// import ClassHeader from '../../../Components/ClassHeaders/page';
import Headingbar from '../../../Components/headingbar/headingbar';

function ProfilePage() {
  return (
    <div className="flex flex-col p-2 sm:ml-64">
      <div className="flex flex-col gap-5">
        <Headingbar title="My profile" />
      </div>
      <MyProfile />
    </div>
  );
}

export default ProfilePage;
