"use client";
export default function HakAkses() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center px-4 py-8">
        <div className="mb-4">
          <svg
            className="w-24 h-24 mx-auto text-red-500 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Akses Ditolak
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Anda tidak memiliki akses ke halaman ini
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
          Hanya administrator yang dapat mengakses halaman ini
        </p>
      </div>
    </div>
  );
}
