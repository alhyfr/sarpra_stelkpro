'use client'
import Image from 'next/image'
import Bone from '@/assets/tobone.png'

export default function Loading({ 
  size = 'md', 
  showImage = true, 
  text = 'Loading...',
  className = '' 
}) {
  // Size configurations
  const sizes = {
    sm: {
      container: 'w-16 h-16',
      ring: 'w-16 h-16 border-2',
      image: 'w-16 h-16',
      text: 'text-sm mt-2'
    },
    md: {
      container: 'w-24 h-24',
      ring: 'w-24 h-24 border-4',
      image: 'w-24 h-24',
      text: 'text-base mt-3'
    },
    lg: {
      container: 'w-32 h-32',
      ring: 'w-32 h-32 border-4',
      image: 'w-32 h-32',
      text: 'text-lg mt-4'
    },
    xl: {
      container: 'w-40 h-40',
      ring: 'w-40 h-40 border-4',
      image: 'w-40 h-40',
      text: 'text-xl mt-5'
    }
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <style>{`
        @keyframes pulseFade {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.95);
          }
        }
        
        .animate-pulse-fade {
          animation: pulseFade 2s ease-in-out infinite;
        }
      `}</style>

      {/* Spinner Container */}
      <div className={`relative ${currentSize.container}`}>
        {/* Spinning Ring */}
        <div 
          className={`absolute inset-0 ${currentSize.ring} border-red-200 dark:border-red-900 rounded-full`}
        />
        <div 
          className={`absolute inset-0 ${currentSize.ring} border-transparent border-t-red-600 dark:border-t-red-500 rounded-full animate-spin`}
        />
        
        {/* Center Image */}
        {showImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`relative ${currentSize.image} animate-pulse-fade`}>
              <Image
                src={Bone}
                alt="Loading"
                fill
                className="object-cover rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading Text */}
      {text && (
        <p className={`${currentSize.text} text-gray-600 dark:text-gray-400 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
}
