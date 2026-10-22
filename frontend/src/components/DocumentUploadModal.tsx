import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, documentType: string, file: File) => Promise<void>;
  childName: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  childName,
}) => {
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('EHCP');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      alert('Please provide a document title and select a file to upload.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(title.trim(), docType, file);
      onClose();
      setTitle('');
      setFile(null);
    } catch (err) {
      console.error(err);
      alert('Failed to upload document.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-light rounded-xl text-purple-dark">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-navy text-base">Upload SEND Document</h3>
              <p className="text-xs text-gray-500">Add statutory document or report for {childName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-navy hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-navy mb-1">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Year 5 Statutory EHCP - St. Jude's Final"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-dark"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-navy mb-1">Document Category</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-dark"
            >
              <option value="EHCP">Statutory EHCP Plan</option>
              <option value="Annual Review">Annual Review Evidence Pack</option>
              <option value="EP Report">Educational Psychologist Report</option>
              <option value="Speech Therapy">Speech & Language Assessment</option>
              <option value="Occupational Therapy">Occupational Therapy Assessment</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-navy mb-1">File (PDF, DOCX)</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-purple-dark transition-all cursor-pointer">
              <input
                type="file"
                id="docUploadInput"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="docUploadInput" className="cursor-pointer block space-y-2">
                <Upload className="w-6 h-6 text-purple-dark mx-auto" />
                <div className="text-xs font-semibold text-navy">
                  {file ? file.name : 'Click to select PDF or assessment report'}
                </div>
                {file && (
                  <div className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                )}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !file}
              className="px-5 py-2 rounded-xl bg-purple-dark hover:bg-purple-900 text-white font-bold cursor-pointer transition-all shadow-xs"
            >
              {submitting ? 'Uploading...' : 'Save Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
