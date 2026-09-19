// const ActionImageGrid = ({ images = [], onImageClick }) => {
//   if (!images.length) return null;

//   if (images.length === 1) {
//     return (
//       <div className="overflow-hidden rounded-2xl">
//         <img
//           src={images[0]}
//           alt="action"
//           onClick={() => onImageClick(0)}
//           className="max-h-[500px] w-full object-cover cursor-pointer"
//         />
//       </div>
//     );
//   }

//   if (images.length === 2) {
//     return (
//       <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-2xl">
//         {images.map((img, index) => (
//         <img
//           key={img + index}
//           src={img}
//           alt={`action-${index}`}
//           onClick={() => onImageClick(index)}
//           className="h-[280px] w-full object-cover cursor-pointer"
//         />
//       ))}
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-2xl">
//       <img
//         src={images[0]}
//         alt="action"
//         onClick={() => onImageClick(0)}
//         className="max-h-[500px] w-full object-cover cursor-pointer"
//       />
//       {images.slice(1, 5).map((img, index) => (
//       <div key={img + index} className="relative">
//         <img
//           src={img}
//           alt={`action-${index + 1}`}
//           onClick={() => onImageClick(index + 1)}
//           className="h-[189px] w-full object-cover cursor-pointer"
//         />
//           {index === 3 && images.length > 5 && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xl font-bold text-white">
//               +{images.length - 5}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ActionImageGrid;

const ActionImageGrid = ({ images = [], onImageClick = () => {} }) => {
  if (!images.length) return null;

  if (images.length === 1) {
    return (
      <div className="overflow-hidden rounded-2xl">
        <img
          src={images[0]}
          alt="action"
          onClick={() => onImageClick(0)}
          className="max-h-[500px] w-full cursor-pointer object-cover transition hover:scale-[1.01]"
        />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-2xl">
        {images.map((img, index) => (
          <img
            key={img + index}
            src={img}
            alt={`action-${index}`}
            onClick={() => onImageClick(index)}
            className="h-[280px] w-full cursor-pointer object-cover transition hover:scale-[1.01]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-2xl">
      <img
        src={images[0]}
        alt="action-main"
        onClick={() => onImageClick(0)}
        className="row-span-2 h-full min-h-[380px] w-full cursor-pointer object-cover transition hover:scale-[1.01]"
      />

      {images.slice(1, 5).map((img, index) => (
        <div key={img + index} className="relative overflow-hidden">
          <img
            src={img}
            alt={`action-${index + 1}`}
            onClick={() => onImageClick(index + 1)}
            className="h-[189px] w-full cursor-pointer object-cover transition hover:scale-[1.01]"
          />

          {index === 3 && images.length > 5 && (
            <div
              onClick={() => onImageClick(index + 1)}
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-xl font-bold text-white"
            >
              +{images.length - 5}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ActionImageGrid;
