import type { Product } from "../types/product";

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (code: string) => void;
}

export function ProductTable({ products, onEdit, onDelete }: Props) {
  if (products.length === 0) {
    return <p className="empty-message">No products found. Add one above.</p>;
  }

  const handleDelete = (product: Product) => {
    if (window.confirm(`Delete "${product.name}" (${product.code})?`)) {
      onDelete(product.code);
    }
  };

  return (
    <table className="product-table">
      <thead>
        <tr>
          <th>Code</th>
          <th>Name</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.code}>
            <td><span className="code-badge">{p.code}</span></td>
            <td>{p.name}</td>
            <td>{p.quantity}</td>
            <td>${p.price.toFixed(2)}</td>
            <td className="action-cell">
              <button className="btn btn-edit" onClick={() => onEdit(p)}>Edit</button>
              <button className="btn btn-delete" onClick={() => handleDelete(p)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
