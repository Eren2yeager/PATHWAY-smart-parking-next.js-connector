export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 lg:h-32 lg:w-32 border-b-2 border-blue-500"></div>
    </div>
  );
}
