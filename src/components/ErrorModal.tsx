import { useEffect } from "react";
import Button from "../ui/Button";

interface ErrorModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

export const ErrorModal = ({ title, message, onClose }: ErrorModalProps) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl transition-all border border-orange-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        <header className="mb-2">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </header>

        <div className="mb-6">
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>

        <div className="w-full flex justify-center">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#ed800f] text-white font-medium rounded-xl shadow-sm hover:bg-[#d4700b] transition-colors"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
};
