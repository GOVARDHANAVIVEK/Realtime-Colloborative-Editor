import React, { createContext,useState, useEffect ,useContext} from "react";

const Notification = ({ message, type }) => {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClosing(true);
      setTimeout(() => setVisible(false), 1000); // Wait for slide-up animation to complete
    }, 3000);

    return () => clearTimeout(timer);
  }, [3000]);

  if (!visible) return null;

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500"; // Success (green) or Error (red)

  return (
    <>
      {/* Inline CSS for Animations */}
      <style>
        {`
          @keyframes slide-down {
            from { transform: translate(-50%, -100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
          }

          @keyframes slide-up {
            from { transform: translate(-50%, 0); opacity: 1; }
            to { transform: translate(-50%, -100%); opacity: 0; }
          }

          .animate-slide-down { animation: slide-down 0.5s ease-out forwards; }
          .animate-slide-up { animation: slide-up 0.5s ease-in forwards; }
        `}
      </style>
    
      <div
        className={`  absolute top-15 left-1/2 transform  px-5 py-3 text-white ${bgColor} rounded-lg shadow-lg transition-transform ${
          closing ? "animate-slide-up" : "animate-slide-down"
        }`}
      >
        
        <div className="flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setClosing(true)} className="ml-3 text-lg font-bold">
            ×
          </button>
        </div>
      </div>
    
    </>
  );
};

export default Notification;
