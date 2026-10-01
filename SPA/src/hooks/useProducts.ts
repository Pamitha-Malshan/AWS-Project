import { useState, useEffect, useCallback } from "react";
import { productApi } from "../api/productApi";
import type { Product } from "../types/product";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productApi.getAll();
      setProducts(res.data ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async (product: Product) => {
    await productApi.create(product);
    await fetchAll();
  };

  const update = async (code: string, product: Product) => {
    await productApi.update(code, product);
    await fetchAll();
  };

  const remove = async (code: string) => {
    await productApi.remove(code);
    await fetchAll();
  };

  return { products, loading, error, create, update, remove, refresh: fetchAll };
}
