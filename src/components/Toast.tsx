import { useEffect } from 'react';
import './Toast.css';

export const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-container">
      <div className="toast-content error">
        {message}
      </div>
    </div>
  );
};