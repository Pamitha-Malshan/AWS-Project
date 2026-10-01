import { useRef, useState } from "react";
import { useDocuments } from "../hooks/useDocuments";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

interface Props {
  onToast: (msg: string) => void;
}

export function DocumentUpload({ onToast }: Props) {
  const { documents, loading, error, upload, download, remove } = useDocuments();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadError(null);
    setUploading(true);
    try {
      await upload(file);
      onToast(`"${file.name}" uploaded successfully.`);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (key: string, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await remove(key);
      onToast(`"${name}" deleted.`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleDownload = async (key: string) => {
    try {
      await download(key);
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Download failed");
    }
  };

  return (
    <section className="doc-section">
      <h2>Documents ({documents.length})</h2>

      {/* Drop zone */}
      <div
        className={`drop-zone ${dragOver ? "drop-zone--active" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="drop-zone-content">
          <span className="drop-zone-icon">📄</span>
          <p className="drop-zone-text">
            {uploading ? "Uploading…" : "Click or drag a file to upload"}
          </p>
          <p className="drop-zone-hint">PDF, Word, Excel, TXT, PNG, JPG — max 10 MB</p>
        </div>
      </div>

      {uploadError && <p className="form-error">{uploadError}</p>}

      {/* Document list */}
      {loading && <p className="loading">Loading documents…</p>}
      {error && <p className="fetch-error">Error: {error}</p>}

      {!loading && documents.length === 0 && (
        <p className="empty-message">No documents uploaded yet.</p>
      )}

      {!loading && documents.length > 0 && (
        <table className="doc-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.key}>
                <td className="doc-name">{doc.name}</td>
                <td>{formatBytes(doc.size)}</td>
                <td>{formatDate(doc.uploadedAt)}</td>
                <td className="action-cell">
                  <button className="btn btn-download" onClick={() => handleDownload(doc.key)}>
                    Download
                  </button>
                  <button className="btn btn-delete" onClick={() => handleDelete(doc.key, doc.name)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
