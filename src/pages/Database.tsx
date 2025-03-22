
import React, { useState, useRef } from 'react';
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

interface FileData {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  type: string;
}

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const fileType = file.name.endsWith('.csv') ? 'csv' : 'excel';
    const fileSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    const today = new Date().toISOString().split('T')[0];
    
    const newFile = {
      id: Date.now().toString(),
      name: file.name,
      size: fileSize,
      uploadDate: today,
      type: fileType
    };
    
    setFiles([...files, newFile]);
    toast({
      title: "File uploaded",
      description: `${file.name} has been successfully uploaded.`,
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      // Call the edge function to analyze the file
      const { data, error } = await supabase.functions.invoke('analyze-file', {
        body: {
          fileName: file.name,
          fileType: file.type,
          analysisType: 'comprehensive'
        },
      });
      
      if (error) throw error;
      
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
        {/* Files List Panel */}
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
        
        {/* Analysis Panel */}
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
