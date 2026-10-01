import { useState, useEffect } from "react";
import type { Product } from "../types/product";

interface Props {
  initial?: Product;
  onSubmit: (product: Product) => Promise<void>;
  onCancel: () => void;
  isEditMode: boolean;
}

const empty: Product = { code: "", name: "", quantity: 0, price: 0 };

export function ProductForm({ initial, onSubmit, onCancel, isEditMode }: Props) {
  const [form, setForm] = useState<Product>(initial ?? empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(initial ?? empty);
    setError(null);
  }, [initial]);

  const set = (field: keyof Product) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === "quantity" || field === "price" ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
      if (!isEditMode) setForm(empty);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h2>{isEditMode ? "Edit Product" : "Add New Product"}</h2>

      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <label>
          Code
          <input
            value={form.code}
            onChange={set("code")}
            placeholder="e.g. P001"
            required
            disabled={isEditMode}
          />
        </label>

        <label>
          Name
          <input
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Wireless Mouse"
            required
          />
        </label>

        <label>
          Quantity
          <input
            type="number"
            min={0}
            value={form.quantity}
            onChange={set("quantity")}
            required
          />
        </label>

        <label>
          Price ($)
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={set("price")}
            required
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : isEditMode ? "Update Product" : "Add Product"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
