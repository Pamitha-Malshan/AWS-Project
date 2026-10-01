import { useState, useEffect, useCallback } from "react";
import { documentApi, type Document } from "../api/documentApi";

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentApi.list();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const upload = useCallback(async (file: File) => {
    const doc = await documentApi.upload(file);
    setDocuments((prev) => [doc, ...prev]);
    return doc;
  }, []);

  const download = useCallback(async (key: string) => {
    const url = await documentApi.getDownloadUrl(key);
    window.open(url, "_blank");
  }, []);

  const remove = useCallback(async (key: string) => {
    await documentApi.remove(key);
    setDocuments((prev) => prev.filter((d) => d.key !== key));
  }, []);

  return { documents, loading, error, upload, download, remove, refresh: fetchDocuments };
}
