import { X } from "lucide-react";
import { Link } from "react-router-dom";


function CommunityComment() {
    return (
      <div className="relative flex flex-col md:flex-row h-auto md:h-screen ">
       
       <Link to="/community">
        <button className="absolute top-4 left-4 p-2 bg-gray-400 text-white rounded-full hover:bg-gray-600">
        <X color="#ffffff" />
        </button>
        </Link>
   
       
        <div className="flex w-full md:w-[70%] items-center justify-center bg-black ">
          <div className="mt-10">
            <img
              src="images/single-class.png"
              alt="Community Image"
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
  
        
        <div className="w-full md:w-[30%] bg-white md:px-4">
          <div className="mt-4 rounded-lg bg-white p-4 shadow-md">
            <div className="mb-3 flex items-start">
              <div className="mr-3 h-10 w-10 overflow-hidden rounded-full bg-gray-300">
                <img
                  src="images/profile-1.png"
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center">
                  <span className="mr-1 font-medium text-gray-800">
                    Vampior Designs
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  December 17, 2024 at 9:17 AM
                </div>
              </div>
            </div>
  
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700 sm:text-lg">
                Requirements:
              </h3>
              <ul className="list-disc pl-6 text-xs text-gray-600 sm:text-sm">
                <li>Onsite Vacancy.</li>
                <li>Average Skills Of Photoshop, Illustrator, Coreldraw.</li>
                <li>Must Have a Laptop.</li>
              </ul>
  
              <p className="mt-2 text-xs text-gray-600 sm:text-sm">
                To apply: Mail Your Resume to{' '}
                <a
                  href="mailto:vampiordesigns@gmail.com"
                  className="text-blue-500 hover:underline"
                >
                  vampiordesigns@gmail.com
                </a>
              </p>
            </div>
            
            {/* <CommentSection /> */}
          </div>
        </div>
      </div>
    );
  }
  
  export default CommunityComment;
  