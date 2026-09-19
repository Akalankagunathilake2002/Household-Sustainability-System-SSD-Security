// import { useState } from "react";
// import { X, ChevronLeft, ChevronRight } from "lucide-react";

// const ImagePreviewModal = ({ images, selectedIndex, onClose }) => {
//   const [currentIndex, setCurrentIndex] = useState(selectedIndex);

//   if (!images || images.length === 0) return null;

//   const next = (e) => {
//     e.stopPropagation();
//     setCurrentIndex((prev) => (prev + 1) % images.length);
//   };

//   const prev = (e) => {
//     e.stopPropagation();
//     setCurrentIndex((prev) =>
//       prev === 0 ? images.length - 1 : prev - 1
//     );
//   };

//   return (
//     <div
//       onClick={onClose}
//       className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
//     >
//       {/* CLOSE */}
//       <button
//         onClick={onClose}
//         className="absolute top-5 right-5 text-white"
//       >
//         <X size={28} />
//       </button>

//       {/* LEFT */}
//       {images.length > 1 && (
//         <button
//           onClick={prev}
//           className="absolute left-5 text-white"
//         >
//           <ChevronLeft size={40} />
//         </button>
//       )}

//       {/* IMAGE */}
//       <img
//         src={images[currentIndex]}
//         className="max-h-[90%] max-w-[90%] rounded-xl"
//       />

//       {/* RIGHT */}
//       {images.length > 1 && (
//         <button
//           onClick={next}
//           className="absolute right-5 text-white"
//         >
//           <ChevronRight size={40} />
//         </button>
//       )}
//     </div>
//   );
// };

// export default ImagePreviewModal;

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const ImagePreviewModal = ({ images = [], startIndex = 0, onClose }) => {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") {
        setIndex((prev) => (prev + 1) % images.length);
      }
      if (e.key === "ArrowLeft") {
        setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [images.length, onClose]);

  if (!images.length) return null;

  const next = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
        className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
      >
        <X size={26} />
      </button>

      {images.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
        >
          <ChevronLeft size={34} />
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full items-center justify-center"
        >
        <img
          src={images[index]}
          alt={`preview-${index}`}
          className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
        />
      </div>

      {images.length > 1 && (
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
        >
          <ChevronRight size={34} />
        </button>
      )}

      <div className="absolute bottom-4 rounded-full bg-black/40 px-3 py-1 text-sm text-white">
        {index + 1} / {images.length}
      </div>
    </div>
  );
};

export default ImagePreviewModal;
