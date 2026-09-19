import { useMemo, useState } from "react";

const categories = [
  "Waste Reduction",
  "Energy Efficiency",
  "Water Conservation",
  "Sustainable DIY",
  "Eco Shopping",
  "Community Action",
];

const ActionComposer = ({ onSubmit, submitting }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const canSubmit = useMemo(() => {
    return title.trim() && description.trim() && category && !submitting;
  }, [title, description, category, submitting]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const limited = [...images, ...files].slice(0, 5);

    setImages(limited);

    const previews = limited.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);

    e.target.value = "";
  };

  const removeNewImage = (index) => {
    const updatedFiles = images.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);

    setImages(updatedFiles);
    setPreviewUrls(updatedPreviews);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory(categories[0]);
    setImages([]);
    setPreviewUrls([]);
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (!canSubmit) return;

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        images,
      });

      resetForm();
    } catch (err) {
      alert(err.message || "Failed to create action");
    }
  };

  return (
    <form
      onSubmit={submitForm}
      className="overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-sm backdrop-blur"
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-800">Share an eco action</h2>
        <p className="mt-1 text-sm text-slate-500">
          Post your sustainable activity with photos.
        </p>
      </div>

      <div className="space-y-4 px-5 py-5">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0 transition focus:border-emerald-500"
        />

        <textarea
          rows={4}
          placeholder="What did you do today for sustainability?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
            Add Photos
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleImageChange}
            />
          </label>
        </div>

        {previewUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {previewUrls.map((src, index) => (
              <div key={src + index} className="relative overflow-hidden rounded-2xl">
                <img
                  src={src}
                  alt={`preview-${index}`}
                  className="h-28 w-full object-cover"
                />
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
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
        <button
          type="button"
          onClick={resetForm}
          className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post Action"}
        </button>
      </div>
    </form>
  );
};

export default ActionComposer;
