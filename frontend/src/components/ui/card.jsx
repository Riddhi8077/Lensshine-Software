export function Card({ children, className = "" }) {
  return (
    <div className={`border rounded-xl p-4 shadow-sm bg-white ${className}`}>
      {children}
    </div>
  );
}