
import React from "react";

// Get Supabase URL from environment or fallback to a default
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || "https://mzoolkwmpppncywkqezd.supabase.co";

interface UpduoInstructionalVideoProps {
  onEnded: () => void;
  onClose: () => void;
}

export const UpduoInstructionalVideo: React.FC<
  UpduoInstructionalVideoProps
> = ({ onEnded, onClose }) => {
  return (
    <div className="rounded-lg overflow-hidden relative pt-[56.25%] bg-black">
      <video
        className="absolute top-0 left-0 w-full h-full object-contain"
        controls
        autoPlay
        src={`${SUPABASE_URL}/storage/v1/object/public/videos//Helping%20people%20find%20required%20reflection.mp4`}
        onEnded={onEnded}
      >
        Your browser doesn't support video playback.
      </video>
      <button
        className="absolute top-4 right-4 bg-white/20 backdrop-blur p-2 rounded-full hover:bg-white/40"
        onClick={onClose}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </button>
    </div>
  );
};
