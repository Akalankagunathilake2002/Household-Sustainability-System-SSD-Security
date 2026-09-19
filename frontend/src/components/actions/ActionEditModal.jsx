import { useEffect, useMemo, useState } from "react";

const categories = [
  "Waste Reduction",
  "Energy Efficiency",
  "Water Conservation",
  "Sustainable DIY",
  "Eco Shopping",
  "Community Action",
];

const ActionEditModal = ({ open, action, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!action) return;
    setTitle(action.title || "");
    setDescription(action.description || "");
    setCategory(action.category || categories[0]);
    setExistingImages(action.images || []);
    setNewImages([]);
    setNewPreviewUrls([]);
  }, [action]);

  const canSave = useMemo(() => {
    return title.trim() && description.trim() && category && !saving;
  }, [title, description, category, saving]);

  if (!open || !action) return null;

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const combined = [...newImages, ...files].slice(0, 5);

    setNewImages(combined);
    setNewPreviewUrls(combined.map((file) => URL.createObjectURL(file)));
    e.target.value = "";
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!canSave) return;

    try {
      setSaving(true);
      await onSave(action._id, {
        title: title.trim(),
        description: description.trim(),
        category,
        existingImages,
        newImages,
      });
      onClose();
    } catch (err) {
      alert(err.message || "Failed to update action");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-800">Edit Action</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
          />

          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {!!existingImages.length && (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Existing images</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {existingImages.map((img, index) => (
                  <div key={img + index} className="relative overflow-hidden rounded-2xl">
                    <img src={img} alt={`existing-${index}`} className="h-28 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
              Add More Photos
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleNewImageChange}
              />
            </label>
          </div>

          {!!newPreviewUrls.length && (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">New images</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {newPreviewUrls.map((img, index) => (
                  <div key={img + index} className="relative overflow-hidden rounded-2xl">
                    <img src={img} alt={`new-${index}`} className="h-28 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionEditModal;
