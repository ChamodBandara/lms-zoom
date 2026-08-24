

function ClassCards() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {[...Array(3)].map((_, index) => (
      <div
        key={index}
        className="mx-auto max-w-sm overflow-hidden rounded-lg bg-white shadow-md"
      >
        <div className="flex items-center px-6 py-4">
          <div className="flex-grow">
            <h3 className="text-lg font-bold text-gray-900">
              Ujith Hemachandra
            </h3>
            <p className="flex items-center text-sm text-gray-500">
              <span className="mr-2">🎓</span>BSc in Chemical Engineering
            </p>
          </div>
          <div className="h-12 w-12 overflow-hidden rounded-full">
            <img
              src="https://via.placeholder.com/50"
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="relative">
          <img
            src="/images/single-class.png"
            alt="Class"
            className="h-auto w-full"
          />
        </div>

        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-800">
            Description
          </h4>
          <p className="mt-2 text-sm text-gray-600">
            This Chemistry Theory Class covers essential topics like
            chemical reactions, molecular structure, and stoichiometry,
            preparing students for the Advanced Level exams.
          </p>
        </div>
      </div>
    ))}
  </div>
  )
}

export default ClassCards