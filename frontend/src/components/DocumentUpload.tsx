import React from 'react'; 
import { Folder, File, FolderPlus, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DocumentUploadProps {
  folders: string[];
  onUpload: (file: File, folder: string) => void;
  onCreateFolder: (folderName: string) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  folders,
  onUpload,
  onCreateFolder,
}) => {
  const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(null);
  const [selectedFolder, setSelectedFolder] = React.useState('');
  const [isCreatingFolder, setIsCreatingFolder] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState('');
  const [isDragging, setIsDragging] = React.useState(false);
  
  // Update selectedFolder when folders change
  React.useEffect(() => {
    if (folders.length > 0 && !selectedFolder) {
      setSelectedFolder(folders[0]);
    }
  }, [folders, selectedFolder]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Files selected:', e.target.files?.length); // Debug log
    setSelectedFiles(e.target.files);
  };
  
  const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Folder selected:', e.target.value); // Debug log
    setSelectedFolder(e.target.value);
  };
  
  const handleUpload = async () => {
    if (selectedFiles && selectedFiles.length > 0 && selectedFolder) {
      try {
        for (const file of Array.from(selectedFiles)) {
          console.log('Uploading file:', file.name);
          await onUpload(file, selectedFolder);
        }
        
        setSelectedFiles(null);
        const fileInput = document.getElementById('document-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        toast.success('Files uploaded successfully');
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error('Failed to upload files');
      }
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
      // Set the newly created folder as selected
      setSelectedFolder(newFolderName.trim());
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      console.log('Files dropped:', files.length); // Debug log
      setSelectedFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    if (selectedFiles) {
      const dt = new DataTransfer();
      const files = Array.from(selectedFiles);
      files.splice(index, 1);
      files.forEach(file => dt.items.add(file));
      setSelectedFiles(dt.files.length > 0 ? dt.files : null);
    }
  };

  // Check if upload should be enabled
  const isUploadEnabled = selectedFiles && selectedFiles.length > 0 && selectedFolder.trim() !== '';
  
  console.log('Upload enabled:', isUploadEnabled, {
    hasFiles: selectedFiles && selectedFiles.length > 0,
    hasFolder: selectedFolder.trim() !== '',
    selectedFolder,
    fileCount: selectedFiles?.length || 0
  }); // Debug log
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center">
            <Upload className="h-6 w-6 text-white mr-3" />
            <h3 className="text-xl font-semibold text-white">Document Upload</h3>
          </div>
          <p className="text-blue-100 text-sm mt-1">Upload and organize your documents efficiently</p>
        </div>
        
        <div className="px-6 py-8">
          <div className="space-y-6">
            {/* Drag and Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDragging 
                  ? 'border-blue-400 bg-blue-50 scale-105' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input 
                type="file" 
                id="document-upload" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                multiple 
                aria-label="Upload files" 
                title="Click to upload files or drag and drop files here" 
              />
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drag and drop files here, or <span className="text-blue-600 font-semibold">browse</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Support for multiple file formats
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Files Display */}
            {selectedFiles && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Selected Files ({selectedFiles.length})
                  </h4>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <File className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        aria-label={`Remove ${file.name}`}
                        title={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Folder Selection and Creation */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="folder" className="block text-sm font-semibold text-gray-900">
                  Select Destination Folder
                </label>
                <div className="relative">
                  <select
                    id="folder"
                    name="folder"
                    value={selectedFolder}
                    onChange={handleFolderChange}
                    className="appearance-none block w-full px-4 py-3 pr-10 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {folders.length === 0 && <option value="">No folders available - create one below</option>}
                    {folders.length > 0 && selectedFolder === '' && <option value="">Select a folder...</option>}
                    {folders.map((folder) => (
                      <option key={folder} value={folder}>
                        {folder}
                      </option>
                    ))}
                  </select>
                  <Folder className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Create New Folder
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(true)}
                  className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                >
                  <FolderPlus className="mr-2 h-5 w-5 text-gray-500" />
                  New Folder
                </button>
              </div>
            </div>
            
            {/* New Folder Creation Form */}
            {isCreatingFolder && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="space-y-3">
                  <label htmlFor="new-folder" className="block text-sm font-semibold text-gray-900">
                    New Folder Name
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      name="new-folder"
                      id="new-folder"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter folder name..."
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                    />
                    <button
                      type="button"
                      onClick={handleCreateFolder}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingFolder(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Upload Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleUpload}
                disabled={!isUploadEnabled}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600 transition-all duration-200 shadow-lg"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload {selectedFiles?.length || 0} File{(selectedFiles?.length || 0) !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};