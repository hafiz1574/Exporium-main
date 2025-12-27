import { useEffect, useMemo, useState } from "react";

import { api } from "../../api/http";
import type { Product } from "../../types/models";

type FormState = Omit<Product, "_id"> & { _id?: string };

const emptyForm: FormState = {
  name: "",
  brand: "",
  category: "",
  description: "",
  price: 0,
  images: [],
  sizes: ["8", "9", "10"],
  stock: 0
};

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [files, setFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const formId = useMemo(() => `admin-product-form-${Math.random().toString(36).slice(2)}`, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const { data } = await api.get("/api/products", { params: { sort: "newest" } });
      setProducts(data.products as Product[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function getApiErrorMessage(err: unknown) {
    const anyErr = err as any;
    return (
      anyErr?.response?.data?.error ||
      anyErr?.message ||
      "Request failed. Please try again (or re-login)."
    );
  }

  const canSave = useMemo(() => {
    return (
      form.name &&
      form.brand &&
      form.category &&
      form.description &&
      form.price >= 0 &&
      form.stock >= 0 &&
      (form.sizes?.length ?? 0) > 0 &&
      (form.images?.length ?? 0) > 0
    );
  }, [form]);

  async function uploadImages() {
    setMessage(null);
    if (!files || files.length === 0) {
      setMessage("Choose image files first.");
      return;
    }
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("images", f));

    try {
      const { data } = await api.post("/api/admin/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const urls = data as string[];
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      setFiles(null);
      setMessage("Images uploaded.");
    } catch (err) {
      setMessage(getApiErrorMessage(err));
    }
  }

  async function save() {
    setMessage(null);
    if (!canSave) return;

    const payload = {
      name: form.name,
      brand: form.brand,
      category: form.category,
      description: form.description,
      price: Number(form.price),
      images: form.images,
      sizes: form.sizes,
      stock: Number(form.stock)
    };

    try {
      if (form._id) {
        await api.put(`/api/admin/products/${form._id}`, payload);
        setMessage("Updated.");
      } else {
        await api.post("/api/admin/products", payload);
        setMessage("Created.");
      }

      setForm(emptyForm);
      setFiles(null);
      await loadProducts();
    } catch (err) {
      setMessage(getApiErrorMessage(err));
    }
  }

  async function remove(productId: string) {
    setMessage(null);
    try {
      await api.delete(`/api/admin/products/${productId}`);
      setMessage("Deleted.");
      await loadProducts();
    } catch (err) {
      setMessage(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Admin products</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
          <div className="text-sm font-medium text-white">{form._id ? "Edit" : "Create"} product</div>

          <div className="mt-4 grid gap-3">
            <div className="grid gap-1">
              <label htmlFor={`${formId}-name`} className="text-xs text-neutral-400">
                Product name
              </label>
              <input
                id={`${formId}-name`}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Name"
                className="rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor={`${formId}-brand`} className="text-xs text-neutral-400">
                Brand
              </label>
              <input
                id={`${formId}-brand`}
                value={form.brand}
                onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                placeholder="Brand"
                className="rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor={`${formId}-category`} className="text-xs text-neutral-400">
                Category
              </label>
              <input
                id={`${formId}-category`}
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="Category"
                className="rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor={`${formId}-description`} className="text-xs text-neutral-400">
                Description
              </label>
              <textarea
                id={`${formId}-description`}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description"
                className="min-h-28 rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <label htmlFor={`${formId}-price`} className="text-xs text-neutral-400">
                  Price
                </label>
                <input
                  id={`${formId}-price`}
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                  placeholder="Price"
                  type="number"
                  className="rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-1">
                <label htmlFor={`${formId}-stock`} className="text-xs text-neutral-400">
                  Stock
                </label>
                <input
                  id={`${formId}-stock`}
                  value={form.stock}
                  onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))}
                  placeholder="Stock"
                  type="number"
                  className="rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-1">
              <label htmlFor={`${formId}-sizes`} className="text-xs text-neutral-400">
                Sizes (comma separated)
              </label>
              <input
                id={`${formId}-sizes`}
                value={form.sizes.join(",")}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    sizes: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  }))
                }
                placeholder="Sizes (comma separated)"
                className="rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm"
              />
            </div>

            <div className="rounded-md border border-neutral-800 bg-black p-3">
              <div className="text-xs text-neutral-400">Images</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.images.map((url) => (
                  <div key={url} className="relative">
                    <img src={url} alt="" className="h-16 w-16 rounded object-cover" />
                    <button
                      className="absolute -right-2 -top-2 rounded-full border border-neutral-700 bg-black px-2 text-xs"
                      onClick={() => setForm((p) => ({ ...p, images: p.images.filter((u) => u !== url) }))}
                      type="button"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="grid gap-1">
                  <label htmlFor={`${formId}-images`} className="text-xs text-neutral-400">
                    Choose image files
                  </label>
                  <input id={`${formId}-images`} type="file" multiple onChange={(e) => setFiles(e.target.files)} />
                </div>
                <button
                  type="button"
                  onClick={uploadImages}
                  className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:border-neutral-500"
                >
                  Upload
                </button>
              </div>
            </div>

            {message ? <div className="text-sm text-neutral-300">{message}</div> : null}

            <div className="flex gap-2">
              <button
                disabled={!canSave}
                onClick={save}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setForm(emptyForm)}
                className="rounded-md border border-neutral-700 px-4 py-2 text-sm hover:border-neutral-500"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 text-sm font-medium text-white">All products</div>
          {loading ? (
            <div className="text-sm text-neutral-400">Loading…</div>
          ) : (
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p._id} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]} alt={p.name} className="h-12 w-12 rounded object-cover" />
                    <div>
                      <div className="text-sm text-white">{p.name}</div>
                      <div className="text-xs text-neutral-500">{p.category}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:border-neutral-500"
                      onClick={() => setForm({ ...p })}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:border-neutral-500"
                      onClick={() => remove(p._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
