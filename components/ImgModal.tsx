import { createPortal } from 'react-dom';
export default function ({
  isVisible,
  url,
  onClose,
}: {
  isVisible: boolean;
  url: string;
  onClose: () => void;
}) {
  return isVisible
    ? createPortal(
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-9999">
          <div className="relative flex items-center max-w-7xl h-1/2 md:h-2/3 lg:h-9/12 p-12 overflow-hidden">
            <img
              src={url}
              alt="Preview | BgGone"
              className="max-h-full max-w-full object-contain"
            />
            <button
              className="absolute top-2 right-2 w-10 h-10 bg-white/30 text-white rounded-full hover:bg-white/40 transition-all"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>,
        document.body
      )
    : null;
}
