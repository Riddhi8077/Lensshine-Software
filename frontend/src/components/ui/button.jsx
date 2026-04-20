import React from "react";

export function Button({ className = "", children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-all 
      bg-primary text-primary-foreground hover:opacity-90 
      px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}