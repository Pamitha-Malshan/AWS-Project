import { useState } from "react";
import { useProducts } from "./hooks/useProducts";
import { ProductForm } from "./components/ProductForm";
import { ProductTable } from "./components/ProductTable";
import { DocumentUpload } from "./components/DocumentUpload";
import type { Product } from "./types/product";
import "./App.css";

export default function App() {
  const { products, loading, error, create, update, remove } = useProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = async (product: Product) => {
    await create(product);
    setShowForm(false);
    notify(`Product "${product.name}" added successfully.`);
  };

  const handleUpdate = async (product: Product) => {
    await update(product.code, product);
    setEditingProduct(null);
    notify(`Product "${product.name}" updated successfully.`);
  };

  const handleDelete = async (code: string) => {
    await remove(code);
    notify(`Product "${code}" deleted.`);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(false);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Product Store</h1>
        <span className="header-sub">AWS RDS + S3</span>
      </header>

      <main className="app-main">
        {toast && <div className="toast">{toast}</div>}

        {!showForm && !editingProduct && (
          <div className="toolbar">
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Add Product
            </button>
          </div>
        )}

        {(showForm || editingProduct) && (
          <ProductForm
            initial={editingProduct ?? undefined}
            isEditMode={editingProduct !== null}
            onSubmit={editingProduct ? handleUpdate : handleAdd}
            onCancel={handleCancel}
          />
        )}

        <section className="table-section">
          <h2>Products ({products.length})</h2>
          {loading && <p className="loading">Loading...</p>}
          {error && <p className="fetch-error">Error: {error}</p>}
          {!loading && (
            <ProductTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </section>

        <div className="section-divider" />

        <DocumentUpload onToast={notify} />
      </main>
    </div>
  );
}
