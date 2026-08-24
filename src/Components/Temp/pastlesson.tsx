function PastLesson() {
    return (
      <div className="flex items-center justify-center w-full ">

        <div className="text-center p-6 bg-white w-full h-screen rounded-lg shadow-lg border border-gray-400">
            <div className="flex justify-center mt-32">
            <img src="/images/Animation - 1739266164016.gif" alt="" className=" w-40" />
            </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">No Past Lessons Available</h2>
          <p className="text-gray-600">It seems you haven't had any past lessons yet. Check back later!</p>
        </div>
      </div>
    )
  }
  
  export default PastLesson;
  