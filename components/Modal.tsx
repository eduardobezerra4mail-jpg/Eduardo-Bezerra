
import React from 'react';
import { XIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto p-8 relative transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes scale-in {
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-scale-in {
            animation: scale-in 0.2s forwards;
          }
        `}</style>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-primary-dark">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-danger p-2 rounded-full transition-colors duration-200"
            aria-label="Fechar modal"
          >
            <XIcon className="w-8 h-8" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
