import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, FileSpreadsheet, Search, BarChart3, PieChart, FileSearch, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AnalysisChat from '@/components/AnalysisChat';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface FileData {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  type: string;
  content?: string; // We'll store a reference or truncated content instead of full file
}

const MAX_STORAGE_ITEM_SIZE = 1024 * 1024; // Limit to 1MB per file in localStorage

const Database = () => {
  const [files, setFiles] = useState<FileData[]>([
    { id: '1', name: 'import_data_2023.xlsx', size: '4.2 MB', uploadDate: '2023-06-15', type: 'excel' },
    { id: '2', name: 'exports_q2.csv', size: '2.8 MB', uploadDate: '2023-06-22', type: 'csv' },
    { id: '3', name: 'customs_declarations.xlsx', size: '5.1 MB', uploadDate: '2023-07-03', type: 'excel' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'chat'>('analysis');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedFilesMetadata = localStorage.getItem('analyzed-files-metadata');
      if (savedFilesMetadata) {
        setFiles(JSON.parse(savedFilesMetadata));
      }
    } catch (e) {
      console.error('Error loading saved files metadata:', e);
    }
  }, []);

  useEffect(() => {
    try {
      const filesMetadata = files.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        uploadDate: file.uploadDate,
        type: file.type
      }));
      localStorage.setItem('analyzed-files-metadata', JSON.stringify(filesMetadata));
    } catch (e) {
      console.error('Error saving files metadata to localStorage:', e);
      toast({
        title: "Storage Error",
        description: "Failed to save file metadata due to limited browser storage.",
        variant: "destructive",
      });
    }
  }, [files, toast]);

  const storeFileContent = (fileId: string, content: string): boolean => {
    try {
      if (content.length > MAX_STORAGE_ITEM_SIZE) {
        const truncatedContent = content.substring(0, MAX_STORAGE_ITEM_SIZE / 2) + 
          "\n\n[Content truncated for storage limitations. Using first and last portions for reference.]\n\n" +
          content.substring(content.length - MAX_STORAGE_ITEM_SIZE / 2);
        
        localStorage.setItem(`file-content-${fileId}`, truncatedContent);
        console.log(`File ${fileId} content was truncated for storage (${content.length} bytes → ${truncatedContent.length} bytes)`);
        return false;
      } else {
        localStorage.setItem(`file-content-${fileId}`, content);
        return true;
      }
    } catch (e) {
      console.error(`Error storing content for file ${fileId}:`, e);
      return false;
    }
  };

  const getFileContent = (fileId: string): string | null => {
    try {
      return localStorage.getItem(`file-content-${fileId}`);
    } catch (e) {
      console.error(`Error retrieving content for file ${fileId}:`, e);
      return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList?.length) return;
    
    const file = fileList[0];
    const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel or CSV file",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileContent = await readFileContent(file);
      
      const fileType = file.name.endsWith('.csv') ? 'csv' : 'excel';
      const fileSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
      const today = new Date().toISOString().split('T')[0];
      
      const newFileId = Date.now().toString();
      const newFile = {
        id: newFileId,
        name: file.name,
        size: fileSize,
        uploadDate: today,
        type: fileType,
      };
      
      const storedCompletely = storeFileContent(newFileId, fileContent);
      
      setFiles(prevFiles => [...prevFiles, newFile]);
      
      if (!storedCompletely) {
        toast({
          title: "File content truncated",
          description: "The file was too large to store completely. Analysis may be based on partial content.",
          variant: "default",
        });
      } else {
        toast({
          title: "File uploaded",
          description: `${file.name} has been successfully uploaded.`,
        });
      }
      
      handleAnalyze(newFile);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Error reading file",
        description: "Failed to read the file content",
        variant: "destructive",
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      
      reader.onerror = () => {
        reject(new Error("File reading error"));
      };
      
      reader.readAsText(file);
    });
  };

  const handleAnalyze = async (file: FileData) => {
    setSelectedFile(file);
    setIsAnalyzing(true);
    setActiveTab('analysis');
    
    toast({
      title: "Analysis started",
      description: `Analyzing ${file.name}...`,
    });

    try {
      console.log(`Analyzing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
      
      const fileContent = getFileContent(file.id) || generateDummyContent(file);
      
      if (!fileContent) {
        throw new Error("Could not retrieve file content for analysis");
      }
      
      const { data, error } = await supabase.functions.invoke('analyze-file', {
        body: {
          fileName: file.name,
          fileType: file.type,
          fileContent: fileContent,
          analysisType: 'comprehensive'
        },
      });
      
      if (error) {
        console.error('Analysis error from edge function:', error);
        throw error;
      }
      
      console.log('Analysis completed successfully:', data);
      setAnalysisResult(data.analysis);
      
      toast({
        title: "Analysis complete",
        description: "The AI has completed analyzing your data.",
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your file. Please try again.",
        variant: "destructive",
      });
      setAnalysisResult("Analysis failed. Please try again or contact support if the issue persists.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateDummyContent = (file: FileData): string => {
    if (file.type === 'csv') {
      return `Date,Product,Country,Quantity,Value,Customs Duty
2023-01-15,Electronics,China,1200,45000,2250
2023-01-22,Textiles,Turkey,850,22000,1100
2023-02-10,Machinery,Germany,340,120000,6000
2023-02-28,Food Products,Italy,1500,28000,1400
2023-03-15,Chemicals,USA,620,55000,2750`;
    } else {
      return `Sheet: Import Data
Columns: Date, Product, Country, Quantity, Value, Customs Duty
Row 1: 2023-01-15, Electronics, China, 1200, 45000, 2250
Row 2: 2023-01-22, Textiles, Turkey, 850, 22000, 1100
Row 3: 2023-02-10, Machinery, Germany, 340, 120000, 6000`;
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database</h1>
          <p className="text-lg text-muted-foreground">Import, manage and analyze your customs and logistics data</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} className="bg-green-600 hover:bg-green-700">
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload File
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Imported Files</span>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <FileSpreadsheet className="mr-2 h-4 w-4 text-blue-600" />
                            {file.name}
                          </div>
                        </TableCell>
                        <TableCell>{file.type.toUpperCase()}</TableCell>
                        <TableCell>{file.size}</TableCell>
                        <TableCell>{file.uploadDate}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAnalyze(file)}
                          >
                            <FileSearch className="mr-1 h-4 w-4" />
                            Analyze
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredFiles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No files found. Upload Excel or CSV files to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>AI Analysis</span>
                </div>
                {selectedFile && (
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'analysis' | 'chat')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                      <TabsTrigger value="chat">Chat</TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              </CardTitle>
              <CardDescription>
                {selectedFile 
                  ? `AI-powered analysis for ${selectedFile.name}` 
                  : "Select a file to analyze"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {!selectedFile && (
                <div className="text-center py-12 text-muted-foreground">
                  <PieChart className="mx-auto h-12 w-12 mb-4 opacity-30" />
                  <p>Select a file from the list to start AI analysis</p>
                </div>
              )}
              
              {isAnalyzing && selectedFile && (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                  <p className="mt-4">Analyzing data from {selectedFile.name}...</p>
                </div>
              )}
              
              {!isAnalyzing && selectedFile && activeTab === 'analysis' && analysisResult && (
                <div className="prose prose-sm max-w-full h-[calc(100vh-20rem)] overflow-y-auto">
                  <div 
                    className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md text-sm"
                    dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br/>') }}
                  />
                  <div className="mt-6 flex space-x-2 justify-end">
                    <Button variant="outline" size="sm">Download Report</Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <FileSearch className="mr-1 h-4 w-4" />
                      Deep Analysis
                    </Button>
                  </div>
                </div>
              )}
              
              {!isAnalyzing && selectedFile && activeTab === 'chat' && (
                <div className="h-[calc(100vh-20rem)]">
                  <AnalysisChat 
                    fileName={selectedFile.name}
                    fileType={selectedFile.type}
                    fileContent={getFileContent(selectedFile.id) || generateDummyContent(selectedFile)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Database;
