const BASE = import.meta.env.VITE_BFF_URL ?? "http://localhost:3000";

export interface Document {
  key: string;
  name: string;
  size: number;
  uploadedAt: string;
  contentType?: string;
}

export const documentApi = {
  async list(): Promise<Document[]> {
    const res = await fetch(`${BASE}/documents`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async upload(file: File): Promise<Document> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE}/documents`, { method: "POST", body: form });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getDownloadUrl(key: string): Promise<string> {
    const res = await fetch(`${BASE}/documents/download?key=${encodeURIComponent(key)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data.url;
  },

  async remove(key: string): Promise<void> {
    const res = await fetch(`${BASE}/documents?key=${encodeURIComponent(key)}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
  },
};
