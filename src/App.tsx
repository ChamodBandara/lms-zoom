import { Routes, Route, BrowserRouter, useParams, useSearchParams } from 'react-router-dom';
import SignupPage from './App/auth/sign-up/page';
import SigninPage from './App/auth/sign-in/page';
import SigninPageAdmin from './App/auth/sign-in-admin/page';
import './index.css';
import 'flowbite';
import ForgotPasswordPage from './App/auth/forgot-password/page';
import ForgotVarificationPage from './App/auth/forgot-varification/page';
import ResetPasswordPage from './App/auth/reset-password/page';
import CompleteResetPassword from './App/auth/complete-reset-password/page';
import SigninVerificationPage from './App/auth/signin-varification/page';

import Dashboard from './App/Dashboard/page';
import ClassHomePage from './App/Classes/page';
import DashboardLayout from './Components/DashboardLayout/DashboardLayout';
import LiveClass from './App/Classes/liveclass/liveclass';
import ProfilePage from './App/Dashboard/Profile/page';
import Bankdetails from './App/Payments/bank details';
import MyPayments from './App/Payments/mypayments';
import PackPayments from './App/Payments/packpayments';
import TuteTracking from './App/tute-tracking/tuteTuteTracking';
import PurchaseStudy from './App/Payments/purchase-study-packs';
import TimeTablePage from './App/Timetable/page';
import EverestIdPage from './App/Dashboard/everest-id/page';
import PastClass from './App/Classes/pastlessons/page';
import StudyPacks from './App/Classes/studypacks/page';
import MyStudyPacks from './App/Classes/studypacks/mypackpage';
import ClassPurchase from './App/Classes/purchase/page';
import Tutediscussions from './App/discussions/page';
import SingleClassPage from './App/Classes/singleclass/page';
import SinglePackPage from './App/Classes/singelpack/page';
import NotificationPage from './App/Dashboard/notification/page';
import PerformancePage from './App/Performance/page';
import SeminaPage from './App/Semina/page';
import ErrorPage from './App/Error/404';
import Forbidden from './App/Error/Forbidden';
import Maintenance from './App/Error/maintanance';
import PaymentErorr from './App/Error/payment-error';
import AllClass from './App/Classes/allclass/page';
import AllTeachers from './App/teachers/page';
import { ChatProvider } from './context/ChatContext';
import SingleTeacher from './App/teachers/single-teacher/page';
import SingleClassPage2 from './App/Classes/singleclass2/page';
import ZoomMeetingPage1  from './Components/singleClass2/ZoomMeetingPage';
import ViewPageMobile from './Components/video-player/video-player-mobile';
import ViewPageMobile1 from './Components/video-player/video-player-mobile1';


import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import 'react-toastify/dist/ReactToastify.css';
import TuteRequestPage from './App/Classes/singleclass/tute-request/page';
// import PackTuteRequestPage from './App/Classes/singelpack/tute-request/page';
// import TuteRequestPage from './App/Classes/singleclass/tute-request/page';

import AuthGuard from './Components/AuthGuard';
import AssignmentPage from './App/assignment/page';
// import { useEffect } from 'react';
// import { onMessageListener } from './firebaseInit';
import CommingSoon from './App/Error/comming-soon';
import ComingClass from './App/comming-soon/class';

import Support from './App/support/support';
import Whatsapp from './Components/support/whatsapp-support';
import CommunityPage from './App/community/page';
import CoummintyComment from './Components/community/coumminty-comment';
import AllChats from './Components/chats/all-chats';
import SingleChat from './Components/chats/single-chat';
import ExamPage from './App/Exams/page';
// import ExamPaper from './Components/Exams/exam-paper';
import McqPage from './App/Exams/mcq/page';
// import AnswerSheet from './Components/Exams/answers';
import AnswersSheet from './App/Exams/mcq/answers';
import HelpDesk from './App/helpdesk/page';
import TermsConditions from './App/auth/sign-up/terms-conditions';
import CommunityAdminPage from './App/communityAdmin/page';
import CommunityUserPage from './App/communityUser/page';
import CommunityTeacherPage from './App/communityTeacher/page';
import PrivacyPolicy from './App/auth/sign-up/privacy-policy';
import Aboutpage from './App/about/page';
import SingleSemina from './App/Semina/singlesemina/page';
import SingleSeminaPage from './App/Semina/singlesemina/page';
import TuteListPage from './App/tute-list/page';
import PackTuteListPage from './App/pack-tutelist/page';
import Todo from './App/Todo/page';
import ZoomLauncher from './Components/ZoomLauncher/ZoomLauncher';
import ViewPage from './Components/video-player/video-player';
import ViewPageIframe from './Components/video-player/video-player-iframe';
import ViewPageIurl from './Components/video-player/video-player-url';
import ViewPage2 from './Components/video-player/video-player2';
import ViewPageTuteDiscussions2 from './Components/video-player/video-player-tute-iscussions2';
import ViewPageTute2 from './Components/video-player/video-playerTute2';
import ViewPageTute2V2 from './Components/video-player/video-playerTute2V2';

const ZoomMeetingPage = () => {
  const { meetingId } = useParams();
  const [searchParams] = useSearchParams();

  const password = searchParams.get('password') || '';
  const userName = searchParams.get('userName') || 'Student';
  const userEmail = searchParams.get('userEmail') || '';
  const leaveUrl = searchParams.get('leaveUrl') || '/dashboard';

  return (
    <ZoomLauncher
      meetingId={meetingId || ''}
      password={password}
      userName={userName}
      userEmail={userEmail}
      leaveUrl={leaveUrl}
    />
  );
};
// import { useEffect } from 'react';



function App() {

  // useEffect(() => {
  //   document.addEventListener("contextmenu", (event) => event.preventDefault());
  //   document.addEventListener("keydown", (event) => {
  //     if (
  //       event.key === "F12" ||
  //       (event.ctrlKey && event.shiftKey && (event.key === "I" || event.key === "J" || event.key === "C")) ||
  //       (event.ctrlKey && event.key === "U")
  //     ) {
  //       event.preventDefault();
  //     }
  //   });

  //   (function() {
  //     let devtools = false;
  //     const element = new Image();
  //     Object.defineProperty(element, "id", {
  //       get: function() {
  //         devtools = true;
  //         window.location.replace("/");
  //       }
  //     });
  //     setInterval(() => {
  //       devtools = false;
  //       if (devtools) {
  //         alert("DevTools detected! Please close it.");
  //         window.location.reload();
  //       }
  //     }, 1000);
  //   })();
  // }, []);

  return (
    <ChatProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<SigninPage />} />
          <Route path="/signinPageAdmin" element={<SigninPageAdmin />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/chats" element={<AllChats />} />
          <Route path="/chat/:chatId" element={<SingleChat/>} />
       
          <Route
            path="/forgot-varification"
            element={<ForgotVarificationPage />}
          />
          <Route path="/password-reset" element={<ResetPasswordPage />} />
          <Route
            path="/complete-reset-password"
            element={<CompleteResetPassword />}
          />
          <Route
            path="/signin-verification"
            element={<SigninVerificationPage />}
          />

           <Route
            path="/zoom-meeting"
            element={
              <DashboardLayout>
                <ZoomMeetingPage1  />
              </DashboardLayout>
            }
          />
          

          {/* Use DashboardLayout for Dashboard and related routes */}
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              </DashboardLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            }
          />
          <Route
            path="/bankdetails"
            element={
              <DashboardLayout>
                <Bankdetails />
              </DashboardLayout>
            }
          />
          <Route
            path="/mypayments"
            element={
              <DashboardLayout>
                <MyPayments />
              </DashboardLayout>
            }
          />
          <Route
            path="/packpayments"
            element={
              <DashboardLayout>
                <PackPayments />
              </DashboardLayout>
            }
          />

          <Route
            path="/purchase-study-packs"
            element={
              <DashboardLayout>
                <PurchaseStudy />
              </DashboardLayout>
            }
          />
          <Route
            path="/time-table"
            element={
              <DashboardLayout>
                <TimeTablePage />
              </DashboardLayout>
            }
          />
          <Route
            path="/tute-tracking"
            element={
              <DashboardLayout>
                <TuteTracking />
              </DashboardLayout>
            }
          />
          <Route
            path="/everest-id"
            element={
              <DashboardLayout>
                <EverestIdPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/singleclass/:id"
            element={
              <DashboardLayout>
                <SingleClassPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/singleclass2/:id"
            element={
              <DashboardLayout>
                <SingleClassPage2 />
              </DashboardLayout>
            }
          />
          <Route
            path="/zoom-launcher/:meetingId"
            element={
              <AuthGuard>
                <ZoomMeetingPage />
              </AuthGuard>
            }
          />
          <Route
            path="/all-class"
            element={
              <DashboardLayout>
                <AllClass />
              </DashboardLayout>
            }
          />
          <Route
            path="/liveclass"
            element={
              <DashboardLayout>
                <LiveClass />
              </DashboardLayout>
            }
          />
          <Route
            path="/pastclass"
            element={
              <DashboardLayout>
                <PastClass />
              </DashboardLayout>
            }
          />
          <Route
            path="/studypacks"
            element={
              <DashboardLayout>
                <StudyPacks />
              </DashboardLayout>
            }
          />

          <Route
            path="/my-studypacks"
            element={
              <DashboardLayout>
                <MyStudyPacks />
              </DashboardLayout>
            }
          />

          <Route
            path="/classpurchase"
            element={
              <DashboardLayout>
                <ClassPurchase />
              </DashboardLayout>
            }
          />

            <Route
            path="/tutediscussions"
            element={
              <DashboardLayout>
                <Tutediscussions />
              </DashboardLayout>
            }
          />

          <Route
            path="/notifications"
            element={
              <DashboardLayout>
                <NotificationPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/performance"
            element={
              <DashboardLayout>
                <PerformancePage />
              </DashboardLayout>
            }
          />
          <Route
            path="/semina-enrollment"
            element={
              <DashboardLayout>
                <SeminaPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/semina-enrollment/:id"
            element={
              <DashboardLayout>
                <SingleSeminaPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/semina-page"
            element={
              <DashboardLayout>
                <SeminaPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/all-teachers"
            element={
              <DashboardLayout>
                <AllTeachers />
              </DashboardLayout>
            }
          />

          <Route
            path="/single-teacher/:id"
            element={
              <DashboardLayout>
                <SingleTeacher />
              </DashboardLayout>
            }
          />

          <Route
            path="/single-pack/:id"
            element={
              <DashboardLayout>
                <SinglePackPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/tute-request/:id"
            element={
              <DashboardLayout>
                <TuteRequestPage />
              </DashboardLayout>
            }
          />
{/* 
          <Route
            path="/tute-request-pack/:id"
            element={
              <DashboardLayout>
                <PackTuteRequestPage />
              </DashboardLayout>
            }
          /> */}

          <Route
            path="/homework"
            element={
              <DashboardLayout>
                <AssignmentPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/support"
            element={
              <DashboardLayout>
                <Support />
              </DashboardLayout>
            }
          />

          <Route
            path="/community"
            element={
              <DashboardLayout>
                <CommunityPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/exams"
            element={
              <DashboardLayout>
                <ExamPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/exams-mcq"
            element={
              <DashboardLayout>
                <McqPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/answers"
            element={
              <DashboardLayout>
                <AnswersSheet />
              </DashboardLayout>
            }
          />

          <Route
            path="/help-desk"
            element={
              <DashboardLayout>
                <HelpDesk />
              </DashboardLayout>
            }
          />

          {/* comming soon DashboardLayout */}

          <Route
            path="/coming-soon"
            element={
              <DashboardLayout>
                <ComingClass />
              </DashboardLayout>
            }
          />

          <Route
            path="/about-us"
            element={
              <DashboardLayout>
                <Aboutpage />
              </DashboardLayout>
            }
          />

          <Route
            // path="/single-semina/:id"
            path="/single-semina"
            element={
              <DashboardLayout>
                <SingleSemina />
              </DashboardLayout>
            }
          />

          <Route
            path="/tute-list/:id"
            element={
              <DashboardLayout>
                <TuteListPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/pack-tutelist/:id"
            element={
              <DashboardLayout>
                <PackTuteListPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/todo"
            element={
              <DashboardLayout>
                <Todo />
              </DashboardLayout>
            }
          />
          <Route path = "/video-player"
          element={
            <DashboardLayout>
              <ViewPage/>
            </DashboardLayout>
          }/>

         <Route path = "/video-player-iframe"
          element={
            <DashboardLayout>
              <ViewPageIframe/>
            </DashboardLayout>
          }/>

          <Route path = "/video-player-url"
            element={
              <DashboardLayout>
                <ViewPageIurl/>
              </DashboardLayout>
          }/>

            <Route path="/video-player-url/:videoId/:id"  element={<ViewPageIurl />} />

             <Route path="/video-player-iframe/:videoId/:id"  element={<ViewPageIframe />} />

             <Route path="/video-player/:videoId/:id/:class_id"  element={<ViewPage />} />

             <Route path="/video-player-mobile/:videoId/:everestId" element={<ViewPageMobile />} />

             <Route path="/video-player-mobile1/:videoId/:everestId/:id/:token" element={<ViewPageMobile1 />} />

             <Route path="/video-playerv2/:videoId/:id/:class_id"  element={<ViewPage2 />} />
             
             <Route path="/video-playerTuteDiscussionsv2/:videoId/:id/:class_id"  element={<ViewPageTuteDiscussions2 />} />
             

             <Route path="/video-playerTutev2/:videoId/:id/:class_id"  element={<ViewPageTute2 />} />
            <Route path="/video-playerTutev2V2/:videoId/:id/:class_id"  element={<ViewPageTute2V2 />} />

            {/* <Route path="/video-playerv2"  element={<ViewPage2 />} /> */}

          {/* Routes without DashboardLayout */}
        
          <Route path="/className" element={<ClassHomePage />} />
          <Route path="/404" element={<ErrorPage />} />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/payment-failed" element={<PaymentErorr />} />
          <Route path="/commingsoon" element={<CommingSoon />} />
          <Route path="/whatsapp" element={<Whatsapp />} />
          <Route path="/comment" element={<CoummintyComment />} />
          <Route path="/terms-and-conditions" element={<TermsConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/communityAdmin" element={<CommunityAdminPage />} />
          <Route path="/communityUser" element={<CommunityUserPage />} />
          <Route path="/communityTeacher" element={<CommunityTeacherPage />} />

          {/* <Route path="/liveclass" element={<LiveClass />} /> */}
          {/* <Route path="/pastclass" element={<PastClass />} /> */}
          {/* <Route path="/studypacks" element={<StudyPacks />} /> */}
          {/* <Route path="/classpurchase" element={<ClassPurchase />} /> */}
        </Routes>
      </BrowserRouter>
    </ChatProvider>
  );
}

export default App;
