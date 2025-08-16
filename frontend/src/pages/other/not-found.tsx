import { useNavigate } from "@tanstack/react-router";

interface NotFoundProps {
  message?: string;
}

const NotFound = ({ message }: NotFoundProps) => {
  const navigate = useNavigate();
  const handleGoBack = () => window.history.back();

  // Default message if not provided
  const displayMessage =
    message || "The page you're looking for doesn't exist or has been moved.";

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <div className='w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 hover:shadow-2xl'>
        {/* Header section */}
        <div className='relative overflow-hidden bg-gray-800 p-8 text-center'>
          <div className='absolute -top-20 -left-20 h-40 w-40 animate-pulse rounded-full bg-gray-700 opacity-20'></div>
          <div className='absolute -right-20 -bottom-40 h-60 w-60 animate-ping rounded-full bg-gray-900 opacity-10'></div>

          <div className='relative z-10'>
            <h1 className='mb-2 animate-bounce text-9xl font-bold text-white'>
              404
            </h1>
            <h2 className='text-2xl font-semibold text-gray-200'>
              Page Not Found
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className='space-y-6 p-8'>
          <div className='animate-fade-in-up'>
            <div className='mx-auto mb-6 h-24 w-24 animate-pulse rounded-xl border-2 border-dashed bg-gray-200' />
            <p className='animate-fade-in mb-8 text-center text-gray-600 delay-100'>
              {displayMessage}
            </p>
          </div>

          <div className='animate-fade-in-up flex flex-col justify-center gap-4 delay-300 sm:flex-row'>
            <button
              onClick={handleGoBack}
              className='rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-800 transition-all duration-300 hover:bg-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none active:scale-95'
            >
              ← Go Back
            </button>

            <button
              onClick={() => navigate({ to: "/" })}
              className='rounded-lg bg-gray-800 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-gray-900 focus:ring-2 focus:ring-gray-700 focus:outline-none active:scale-95'
            >
              Home Page
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className='animate-fade-in bg-gray-100 px-8 py-4 text-center text-sm text-gray-600 delay-500'>
          Need help?{" "}
          <a href='#' className='text-gray-800 hover:underline'>
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
