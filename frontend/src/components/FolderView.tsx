import React from 'react';
import { File, Folder, Download, Trash2, Clock, FileText } from 'lucide-react';
import { Document } from '../types';
import { formatDate } from '../utils/formatDate';

interface FolderViewProps {
  folders: string[];
  documents: Document[];
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
  onDownload: (document: Document) => void;
  onDelete: (document: Document) => void;
}

export const FolderView: React.FC<FolderViewProps> = ({
  folders,
  documents,
  selectedFolder,
  onSelectFolder,
  onDownload,
  onDelete,
}) => {
  const filteredDocuments = documents.filter(doc => doc.folder === selectedFolder);
  
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    const iconMap = {
      pdf: { bg: 'bg-red-100', text: 'text-red-600', icon: FileText },
      doc: { bg: 'bg-blue-100', text: 'text-blue-600', icon: FileText },
      docx: { bg: 'bg-blue-100', text: 'text-blue-600', icon: FileText },
      xls: { bg: 'bg-green-100', text: 'text-green-600', icon: FileText },
      xlsx: { bg: 'bg-green-100', text: 'text-green-600', icon: FileText },
      jpg: { bg: 'bg-purple-100', text: 'text-purple-600', icon: File },
      jpeg: { bg: 'bg-purple-100', text: 'text-purple-600', icon: File },
      png: { bg: 'bg-purple-100', text: 'text-purple-600', icon: File },
      default: { bg: 'bg-gray-100', text: 'text-gray-600', icon: File }
    };
    
    const config = iconMap[extension as keyof typeof iconMap] || iconMap.default;
    const IconComponent = config.icon;
    
    return (
      <div className={`${config.bg} ${config.text} p-3 rounded-xl shadow-sm`}>
        <IconComponent className="h-6 w-6" />
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Sidebar */}
      <div className="xl:col-span-1 bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-4">
          <div className="flex items-center">
            <Folder className="h-5 w-5 text-white mr-2" />
            <h3 className="font-semibold text-white text-sm">Folders</h3>
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-1">
            {folders.map((folder) => (
              <button
                key={folder}
                onClick={() => onSelectFolder(folder)}
                className={`w-full text-left flex items-center px-3 py-3 text-sm rounded-xl transition-all duration-200 ${
                  selectedFolder === folder
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:scale-102'
                }`}
              >
                <Folder className={`mr-3 h-4 w-4 ${selectedFolder === folder ? 'text-white' : 'text-gray-500'}`} />
                <span className="font-medium truncate">{folder}</span>
                <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                  selectedFolder === folder 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {documents.filter(doc => doc.folder === folder).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="xl:col-span-4 bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white text-lg">
                {selectedFolder}
              </h3>
              <p className="text-indigo-100 text-sm">
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <span className="text-white font-medium text-sm">
                {filteredDocuments.length} items
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((document) => (
                <div key={document.id} className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {getFileIcon(document.original_name)}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors" title={document.original_name}>
                          {document.original_name}
                        </h4>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(document.upload_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => onDownload(document)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(document)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                This folder is empty. Upload some documents to get started and organize your files.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};