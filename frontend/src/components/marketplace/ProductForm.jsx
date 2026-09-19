import React, { useEffect, useState } from "react";
import { X, ImageIcon, Tag, DollarSign, Layers, Sparkles, FileText, Activity, CheckCircle2, LocateFixed, Loader2 } from "lucide-react";
import { CATEGORY_LABELS } from "../../utils/categoryLabels";
import placeholderImage from "../../assets/no-image.jpg";

const Field = ({ label, icon: Icon, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 uppercase tracking-wider">
      {Icon && <Icon size={12} className="text-teal-500" />}
      {label}
    </label>
    {children}
  </div>
);

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all placeholder:text-gray-300";

export const ProductForm = ({ isOpen, onClose, onSubmit, product = null }) => {
  const isEdit = !!product;

  const [formData, setFormData] = useState({
    title: "", description: "", price: "",
    category: "", condition: "", imageUrl: "", status: "Available",
    lat: "", lng: "", locationName: "",
  });
  const [preview, setPreview] = useState("");
  const [imgError, setImgError] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | loading | resolved | denied
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        title:        product.title        || "",
        description:  product.description  || "",
        price:        product.price        || "",
        category:     product.category     || "",
        condition:    product.condition    || "",
        imageUrl:     product.imageUrl     || "",
        status:       product.status       || "Available",
        lat:          "",
        lng:          "",
        locationName: product.locationName  || "",
      });
      setPreview(product.imageUrl || "");
      setImageFile(null);
      setLocationStatus(product.locationName ? "resolved" : "idle");
    } else {
      setFormData({ title: "", description: "", price: "", category: "", condition: "", imageUrl: "", status: "Available", lat: "", lng: "", locationName: "" });
      setPreview("");
      setImageFile(null);
      setLocationStatus("loading");
      // Auto-capture geolocation for new products
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
              const res = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
              const data = await res.json();
              const city = data.city || data.locality || data.principalSubdivision || "Unknown";
              setFormData(prev => ({ ...prev, lat: latitude, lng: longitude, locationName: city }));
              setLocationStatus("resolved");
            } catch {
              setFormData(prev => ({ ...prev, lat: latitude, lng: longitude, locationName: "" }));
              setLocationStatus("resolved");
            }
          },
          () => setLocationStatus("denied")
        );
      } else {
        setLocationStatus("denied");
      }
    }
    setImgError(false);
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "imageUrl") { setPreview(value); setImgError(false); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setImgError(false);
    }
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== "") data.append(key, formData[key]);
    });
    if (imageFile) {
      data.append("image", imageFile);
    }
    try {
      await onSubmit(data); 
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-3xl flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100" style={{ maxHeight: "92vh" }}>

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {isEdit ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? "Update the listing details below" : "Fill in the details to create a new listing"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-6 py-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* LEFT COLUMN */}
              <div className="flex flex-col gap-4">

                <Field label="Title" icon={Tag}>
                  <input
                    name="title" value={formData.title} onChange={handleChange}
                    required placeholder="e.g. Wooden Chair"
                    className={inputClass}
                  />
                </Field>

                <Field label="Price (Rs.)" icon={DollarSign}>
                  <input
                    type="number" name="price" value={formData.price}
                    onChange={handleChange} required placeholder="0"
                    className={inputClass}
                  />
                </Field>

                <Field label="Category" icon={Layers}>
                  <select
                    name="category" value={formData.category}
                    onChange={handleChange} required
                    className={inputClass}
                  >
                    <option value="">Select Category</option>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Condition" icon={Sparkles}>
                  <input
                    name="condition" value={formData.condition}
                    onChange={handleChange} placeholder="e.g. Like New, Good"
                    className={inputClass}
                  />
                </Field>

                {isEdit && (
                  <Field label="Status" icon={Activity}>
                    <select
                      name="status" value={formData.status}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </Field>
                )}

                {/* Location chip */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 uppercase tracking-wider">
                    <LocateFixed size={12} className="text-teal-500" /> Location
                  </label>
                  {locationStatus === "loading" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-100 text-xs text-teal-600">
                      <Loader2 size={13} className="animate-spin" /> Detecting location…
                    </div>
                  )}
                  {locationStatus === "resolved" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-100 text-xs font-medium text-teal-700">
                      <LocateFixed size={13} />
                      {formData.locationName || "Location captured"}
                    </div>
                  )}
                  {locationStatus === "denied" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-400">
                      <LocateFixed size={13} /> Location not available
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN */}
              <div className="flex flex-col gap-4">

                {/* Image preview card */}
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="relative bg-teal-50 flex items-center justify-center" style={{ minHeight: 172 }}>
                    {preview && !imgError ? (
                      <>
                        <img
                          src={preview}
                          alt="Preview"
                          onError={() => setImgError(true)}
                          className="w-full h-44 object-cover"
                        />
                        <span className="absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold bg-teal-500 text-white">
                          <CheckCircle2 size={11} /> Preview
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-10">
                        <ImageIcon size={32} className="text-teal-200" />
                        <span className="text-xs text-teal-400">No image yet</span>
                      </div>
                    )}
                  </div>
                  <div className="px-3 py-3 bg-gray-50 border-t border-gray-100">
                    <Field label="Product Image" icon={ImageIcon}>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-medium cursor-pointer hover:bg-teal-600 transition-all shadow-sm">
                          <ImageIcon size={16} />
                          {imageFile ? "Change Image" : "Select Image"}
                          
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>

                        <span className="text-xs text-gray-500 truncate max-w-[150px]">
                          {imageFile ? imageFile.name : "No file selected"}
                        </span>

                      </div>
                    </Field>
                  </div>
                </div>

                {/* Description */}
                <Field label="Description" icon={FileText}>
                  <textarea
                    name="description" value={formData.description}
                    onChange={handleChange} rows={4}
                    placeholder="Describe the product..."
                    className={`${inputClass} resize-none`}
                  />
                </Field>

              </div>
            </div>

            {/* FOOTER BUTTONS */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? "Saving..." : (isEdit ? "Update Product" : "Create Product")}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default ProductForm;