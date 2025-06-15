import React, { useState, useEffect } from 'react';
import { DocumentUpload } from '../components/DocumentUpload';
import { FolderView } from '../components/FolderView';
import { useDocumentsStore } from '../store/documentsStore';
import { Document } from '../types';
import { toast } from 'react-hot-toast';

export const Documents: React.FC = () => {
  const { 
    documents, 
    folders, 
    addDocument, 
    addFolder, 
    deleteDocument,
    fetchDocuments,
    fetchFolders,
    isLoading 
  } = useDocumentsStore();
  
  const [selectedFolder, setSelectedFolder] = useState(folders[0] || 'General');

  useEffect(() => {
    fetchDocuments();
    fetchFolders();
  }, [fetchDocuments, fetchFolders]);
  
  const handleUpload = async (file: File, folder: string) => {
    try {
      await addDocument(file, folder);
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Failed to upload document:', error);
      toast.error('Failed to upload document');
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      await addFolder(folderName);
      setSelectedFolder(folderName);
      toast.success('Folder created successfully');
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const handleDelete = async (document: Document) => {
    if (window.confirm(`Are you sure you want to delete ${document.original_name}?`)) {
      try {
        await deleteDocument(document.id);
        toast.success('Document deleted successfully');
      } catch (error) {
        console.error('Failed to delete document:', error);
        toast.error('Failed to delete document');
      }
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      window.location.href = `${import.meta.env.VITE_API_URL}/documents/download/${document.id}`;
    } catch (error) {
      console.error('Failed to download document:', error);
      toast.error('Failed to download document');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-r-4 border-l-4 border-indigo-400 animate-pulse"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading documents...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Management</h1>
          <p className="text-gray-600">Upload, organize, and manage your documents with ease</p>
        </div>
        
        <DocumentUpload 
          folders={folders} 
          onUpload={handleUpload} 
          onCreateFolder={handleCreateFolder} 
        />
        
        <FolderView 
          folders={folders}
          documents={documents}
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};
