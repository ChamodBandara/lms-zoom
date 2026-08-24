import Headingbar from '../../Components/headingbar/headingbar';

function Aboutpage() {
  return (
    <div className="flex  flex-col bg-gray-100 p-4 md:ml-64 lg:ml-64 ">
      <div className="flex flex-col gap-4">
        <Headingbar title="About us" />

        <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
          <img src="/images/logo.png" className="mx-auto mb-6 w-60" />

          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Our Vision</h2>
          <ul className="mb-6 list-disc list-outside space-y-2 pl-5 text-gray-700">
            <li>
              Empowering learners islandwide by providing accessible, knowledgeable, and innovative 
              online education designed to enhance lifelong learning, skill development, and personal 
              growth through personality building, regardless of location and background.
            </li>
            <li>
              To revolutionize education by creating learners islandwide equipped with satisfactory 
              knowledge and skills that thrive in a fast-moving and rapidly changing world.
            </li>
            <li>
              Building the future of global education where everyone can access high-quality learning 
              that empowers learners to reach their full potential and target-oriented job market.
            </li>
          </ul>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Our Mission</h2>
          <ul className="mb-6 list-disc list-outside space-y-2 pl-5 text-gray-700">
            <li>
              To provide individuals with high-quality, flexible, commendable, and accessible online 
              education to unlock their full potential through personality building, skill development, 
              and personalized learning experiences, driving positive thinking and outstanding change 
              in their lives and careers.
            </li>
            <li>
              To bridge the education gap by offering timely needed, job-oriented, accessible, and 
              dynamic online courses that prepare learners for personal success in an ever-evolving workforce.
            </li>
          </ul>

          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Our Commitment</h2>
          <p className="mb-6 ml-3 leading-relaxed text-gray-700">
            We are committed to fostering a supportive and engaging learning environment. Our platform is 
            designed to provide personalized learning paths, interactive content, and expert guidance to 
            ensure every learner achieves their goals. We believe in the power of education to transform 
            lives and are dedicated to making it accessible to all.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Aboutpage;
