import React from 'react';

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto p-6 relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-2xl" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}
