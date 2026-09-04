import React, { useState, useEffect } from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
}

export const Button = ({ type, onClick, children, className }: ButtonProps) => {
  const [isActiveRing, setIsActiveRing] = useState(false);

  useEffect(() => {
    if (!isActiveRing) return;

    const timer = setTimeout(() => {
      setIsActiveRing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActiveRing]);

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsActiveRing(true);

    if (onClick) {
      onClick(event);
    }
  };

  const baseClasses =
    "inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#ed800f] hover:bg-orange-600 focus:outline-none transition-all duration-200 ease-in-out";

  const temporaryRingClasses = isActiveRing
    ? "ring-2 ring-offset-2 ring-[#ed800f]"
    : "";

  return (
    <button
      className={`${baseClasses} ${temporaryRingClasses} ${className || ""}`}
      type={type || "button"}
      onClick={handleButtonClick}
    >
      {children}
    </button>
  );
};

export default Button;
