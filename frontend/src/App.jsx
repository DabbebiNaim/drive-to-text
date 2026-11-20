
import { useMemo, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  FolderOpen,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  FileJson,
  RefreshCw,
  ScanText,
} from "lucide-react";
import "./App.css";

function App() {
  const [folderUrl, setFolderUrl] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [results, setResults] = useState({});
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [processingIds, setProcessingIds] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedCount = selectedIds.length;

  const allSelected = useMemo(
    () => files.length > 0 && files.every((file) => selectedIds.includes(file.id)),
    [files, selectedIds]
  );

  const successfulCount = Object.values(results).filter(
    (result) => result.status === "success"
  ).length;

  const failedCount = Object.values(results).filter(
    (result) => result.status === "failed"
  ).length;

  async function loadFiles(event) {
    event.preventDefault();

    if (!folderUrl.trim()) {
      setError("Please enter a Google Drive folder URL.");
      return;
    }

    setLoadingFiles(true);
    setError("");
    setMessage("");
    setFiles([]);
    setSelectedIds([]);
    setResults({});

    try {
      const response = await fetch("/api/drive/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_url: folderUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load Drive files.");
      }

      setFiles(data.files || []);
      setMessage(`${data.total} supported file(s) found.`);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoadingFiles(false);
    }
  }

  function toggleFile(fileId) {
    setSelectedIds((current) =>
      current.includes(fileId)
        ? current.filter((id) => id !== fileId)
        : [...current, fileId]
    );
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : files.map((file) => file.id));
  }

  async function extractFiles(fileIds) {
    if (!fileIds.length) {
      setError("Select at least one file to extract.");
      return;
    }

    setError("");
    setMessage("");

    setProcessingIds((current) => [...new Set([...current, ...fileIds])]);

    setResults((current) => {
      const updated = { ...current };
      fileIds.forEach((id) => {
        updated[id] = { file_id: id, status: "processing", text: "", error: null };
      });
      return updated;
    });

    try {
      const response = await fetch("/api/drive/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_ids: fileIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Extraction failed.");
      }

      setResults((current) => {
        const updated = { ...current };
        data.results.forEach((result) => {
          updated[result.file_id] = result;
        });
        return updated;
      });

      setMessage(
        `Extraction finished: ${data.successful} successful, ${data.failed} failed.`
      );
    } catch (err) {
      setError(err.message || "Unable to extract files.");

      setResults((current) => {
        const updated = { ...current };
        fileIds.forEach((id) => {
          if (updated[id]?.status === "processing") {
            updated[id] = {
              file_id: id,
              status: "failed",
              text: "",
              error: err.message,
            };
          }
        });
        return updated;
      });
    } finally {
      setProcessingIds((current) =>
        current.filter((id) => !fileIds.includes(id))
      );
    }
  }

  function exportJson() {
    const exportData = {
      exported_at: new Date().toISOString(),
      total: Object.keys(results).length,
      results: Object.values(results),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "drive-to-text-results.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  function formatSize(size) {
    const bytes = Number(size || 0);

    if (!bytes) return "Size unavailable";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><ScanText size={23} /></div>
          <span>Drive<span className="brand-accent">ToText</span></span>
        </div>

        <div className="sidebar-label">WORKSPACE</div>
        <div className="nav-item active">
          <FolderOpen size={18} />
          <span>File extraction</span>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <ScanText size={20} />
            <strong>Smart extraction</strong>
            <p>PDF text parsing and image OCR in one workspace.</p>
          </div>
          <span className="version">Drive-to-Text · v1.0</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Workspace / File extraction</div>
            <h1>Document extraction</h1>
            <p className="subtitle">
              Retrieve files from Google Drive and turn their contents into text.
            </p>
          </div>
          <div className="top-status">
            <span className="status-dot" />
            API workspace
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue"><FolderOpen size={19} /></div>
            <div><span>Files found</span><strong>{files.length}</strong></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><CheckCircle2 size={19} /></div>
            <div><span>Successful</span><strong>{successfulCount}</strong></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red"><AlertCircle size={19} /></div>
            <div><span>Failed</span><strong>{failedCount}</strong></div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Connect Google Drive</h2>
              <p>Paste the link to a publicly accessible Drive folder.</p>
            </div>
            <div className="heading-icon"><FolderOpen size={21} /></div>
          </div>

          <form className="folder-form" onSubmit={loadFiles}>
            <input
              type="url"
              value={folderUrl}
              onChange={(event) => setFolderUrl(event.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              aria-label="Google Drive folder URL"
            />
            <button className="primary-button" type="submit" disabled={loadingFiles}>
              {loadingFiles ? <Loader2 className="spin" size={17} /> : <Upload size={17} />}
              {loadingFiles ? "Loading..." : "Load files"}
            </button>
          </form>

          {message && <div className="notice success-notice">{message}</div>}
          {error && <div className="notice error-notice">{error}</div>}
        </section>

        <section className="panel">
          <div className="panel-heading files-heading">
            <div>
              <h2>Your files</h2>
              <p>Select individual files or process several together.</p>
            </div>
            <button
              className="secondary-button"
              onClick={() => extractFiles(selectedIds)}
              disabled={selectedCount === 0 || processingIds.length > 0}
            >
              <ScanText size={17} />
              Extract selected ({selectedCount})
            </button>
          </div>

          {files.length > 0 ? (
            <>
              <div className="select-all">
                <label>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                  Select all files
                </label>
                <span>{files.length} file(s)</span>
              </div>

              <div className="file-list">
                {files.map((file) => {
                  const result = results[file.id];
                  const isProcessing = processingIds.includes(file.id);
                  const isPdf = file.mime_type === "application/pdf";

                  return (
                    <div className="file-row" key={file.id}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(file.id)}
                        onChange={() => toggleFile(file.id)}
                        aria-label={`Select ${file.name}`}
                      />

                      <div className={`file-icon ${isPdf ? "pdf" : "image"}`}>
                        {isPdf ? <FileText size={21} /> : <ImageIcon size={21} />}
                      </div>

                      <div className="file-info">
                        <strong>{file.name}</strong>
                        <span>{isPdf ? "PDF document" : "Image"} · {formatSize(file.size)}</span>
                      </div>

                      <div className="file-actions">
                        {isProcessing ? (
                          <span className="result-status processing">
                            <Loader2 size={14} className="spin" /> Processing
                          </span>
                        ) : result?.status === "success" ? (
                          <span className="result-status completed">
                            <CheckCircle2 size={14} /> Completed
                          </span>
                        ) : result?.status === "failed" ? (
                          <span className="result-status failed">
                            <AlertCircle size={14} /> Failed
                          </span>
                        ) : (
                          <span className="pending-label">Not processed</span>
                        )}

                        <button
                          className="text-button"
                          onClick={() => extractFiles([file.id])}
                          disabled={isProcessing || processingIds.length > 0}
                        >
                          Extract
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon"><FolderOpen size={27} /></div>
              <strong>No files loaded yet</strong>
              <p>Enter a Google Drive folder link above to get started.</p>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Extraction results</h2>
              <p>Review extracted text and download your results.</p>
            </div>
            <button
              className="secondary-button"
              onClick={exportJson}
              disabled={Object.keys(results).length === 0}
            >
              <Download size={17} />
              Export JSON
            </button>
          </div>

          {Object.keys(results).length > 0 ? (
            <div className="results-list">
              {Object.values(results).map((result) => {
                const file = files.find((item) => item.id === result.file_id);

                return (
                  <article className="result-card" key={result.file_id}>
                    <div className="result-card-heading">
                      <div className="result-file-icon"><FileJson size={18} /></div>
                      <div className="result-file-name">
                        <strong>{file?.name || result.file_id}</strong>
                        <span>{result.status}</span>
                      </div>
                      {result.status === "success" ? (
                        <CheckCircle2 className="result-check" size={19} />
                      ) : result.status === "failed" ? (
                        <AlertCircle className="result-fail" size={19} />
                      ) : (
                        <RefreshCw size={18} />
                      )}
                    </div>

                    <pre>{result.text || result.error || "Waiting for extraction..."}</pre>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state compact-empty">
              <div className="empty-icon"><FileText size={25} /></div>
              <strong>No extraction results</strong>
              <p>Extract a file to see its content here.</p>
            </div>
          )}
        </section>

        <footer className="footer">
          Drive-to-Text · PDF extraction powered by pypdf · Image OCR powered by Tesseract
        </footer>
      </main>
    </div>
  );
}

export default App;
