import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Search, FileText, Trash2, Eye, Filter, Loader2, UploadCloud, X } from 'lucide-react';
import { documentService } from '../../services/documentService';
import { Document } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { showToast } from '../../components/ui/Toast';
import { LoadingSpinner, EmptyState } from '../../components/ui/LoadingStates';
import { formatDate, formatFileSize, getRiskBadgeClass, getRiskLabel, getSeverityBadgeClass } from '../../utils/helpers';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    const docs = await documentService.getDocuments();
    setDocuments(docs);
    setLoading(false);
  }, []);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'docx', 'txt', 'csv'].includes(ext || '')) {
        showToast({ type: 'error', title: 'Invalid file type', message: `${file.name} is not a supported format` });
        continue;
      }
      try {
        await documentService.uploadDocument(file);
        showToast({ type: 'success', title: 'Document uploaded', message: `${file.name} is being analyzed` });
      } catch {
        showToast({ type: 'error', title: 'Upload failed', message: `Failed to upload ${file.name}` });
      }
    }
    await loadDocuments();
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    await documentService.deleteDocument(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    showToast({ type: 'success', title: 'Document deleted' });
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const filteredDocs = documents.filter(d => {
    const matchSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRisk = filterRisk === 'all' || d.riskLevel === filterRisk;
    return matchSearch && matchRisk;
  });

  if (loading) return <LoadingSpinner size="lg" text="Loading documents..." />;

  return (
    <div className="page-container animate-fadeIn">
      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.txt,.csv" className="hidden" onChange={e => handleUpload(e.target.files)} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-sm font-medium text-gray-700">Uploading & analyzing documents...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center">
              <UploadCloud className="w-7 h-7 text-primary-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Drop files here or click to upload</p>
              <p className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT, CSV — Max 50MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="input-field w-auto">
            <option value="all">All Risk Levels</option>
            <option value="trusted">Trusted</option>
            <option value="moderate">Moderate Risk</option>
            <option value="high">High Risk</option>
            <option value="blocked">Blocked</option>
            <option value="scanning">Scanning</option>
          </select>
          {(searchQuery || filterRisk !== 'all') && (
            <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setFilterRisk('all'); }}>
              <X className="w-4 h-4" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {filteredDocs.length === 0 ? (
        <EmptyState icon={<FileText className="w-8 h-8" />} title="No documents found" description={searchQuery ? 'Try a different search query' : 'Upload your first document to get started'} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Size</th>
                  <th className="table-header">Upload Date</th>
                  <th className="table-header">Trust Score</th>
                  <th className="table-header">Risk Level</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium text-gray-900 max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                    </td>
                    <td className="table-cell uppercase text-gray-500 text-xs">{doc.type}</td>
                    <td className="table-cell text-gray-500">{formatFileSize(doc.size)}</td>
                    <td className="table-cell text-gray-500">{formatDate(doc.uploadDate)}</td>
                    <td className="table-cell">
                      {doc.status === 'scanning' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                      ) : (
                        <span className={`font-semibold ${doc.trustScore >= 80 ? 'text-success-600' : doc.trustScore >= 60 ? 'text-warning-600' : 'text-danger-600'}`}>
                          {doc.trustScore}
                        </span>
                      )}
                    </td>
                    <td className="table-cell"><span className={getRiskBadgeClass(doc.riskLevel)}>{getRiskLabel(doc.riskLevel)}</span></td>
                    <td className="table-cell"><span className="badge-neutral capitalize">{doc.status}</span></td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedDoc(doc)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-gray-400 hover:text-danger-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      <Modal isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)} title="Document Details" size="lg">
        {selectedDoc && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'File Name', value: selectedDoc.name },
                { label: 'File Type', value: selectedDoc.type.toUpperCase() },
                { label: 'File Size', value: formatFileSize(selectedDoc.size) },
                { label: 'Upload Date', value: formatDate(selectedDoc.uploadDate) },
                { label: 'Uploaded By', value: selectedDoc.uploadedBy },
                { label: 'Status', value: selectedDoc.status },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: selectedDoc.trustScore >= 80 ? '#16a34a' : selectedDoc.trustScore >= 60 ? '#d97706' : '#dc2626' }}>
                  {selectedDoc.trustScore}
                </p>
                <p className="text-xs text-gray-500">Trust Score</p>
              </div>
              <div className="flex-1">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedDoc.trustScore}%`,
                      backgroundColor: selectedDoc.trustScore >= 80 ? '#16a34a' : selectedDoc.trustScore >= 60 ? '#d97706' : '#dc2626'
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{getRiskLabel(selectedDoc.riskLevel)}</p>
              </div>
            </div>

            {selectedDoc.findings.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Security Findings</h4>
                <div className="space-y-2">
                  {selectedDoc.findings.map(f => (
                    <div key={f.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className={getSeverityBadgeClass(f.severity)}>{f.severity}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{f.type}</p>
                        <p className="text-xs text-gray-500">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDoc.threats.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Detected Threats</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDoc.threats.map((t, i) => <span key={i} className="badge-danger">{t}</span>)}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="danger" size="sm" onClick={() => { handleDelete(selectedDoc.id); setSelectedDoc(null); }} icon={<Trash2 className="w-4 h-4" />}>Delete</Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedDoc(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
