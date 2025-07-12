import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Image, 
  Video, 
  Music, 
  File, 
  Mic,
  Camera,
  Play,
  Pause,
  Square,
  Download,
  Search,
  Eye,
  Headphones,
  FileText,
  Zap,
  Brain,
  Settings
} from 'lucide-react';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  url: string;
  thumbnail?: string;
  duration?: number;
  dimensions?: { width: number; height: number };
  metadata: {
    format: string;
    createdAt: Date;
    processedAt?: Date;
    analysis?: {
      text?: string;
      objects?: string[];
      sentiment?: 'positive' | 'negative' | 'neutral';
      confidence?: number;
    };
  };
}

interface ProcessingTask {
  id: string;
  fileId: string;
  type: 'transcription' | 'object-detection' | 'text-extraction' | 'sentiment-analysis';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
}

export default function MultiModalSupport() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [processingTasks, setProcessingTasks] = useState<ProcessingTask[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load sample files
    loadSampleFiles();
    
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const loadSampleFiles = () => {
    const sampleFiles: MediaFile[] = [
      {
        id: '1',
        name: 'project-demo.mp4',
        type: 'video',
        size: 15728640, // 15MB
        url: '/api/files/sample-video.mp4',
        thumbnail: '/api/files/sample-video-thumb.jpg',
        duration: 120,
        dimensions: { width: 1920, height: 1080 },
        metadata: {
          format: 'mp4',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          processedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          analysis: {
            text: 'This video demonstrates the key features of our AI-powered development platform...',
            objects: ['computer', 'screen', 'code', 'interface'],
            sentiment: 'positive',
            confidence: 0.92
          }
        }
      },
      {
        id: '2',
        name: 'architecture-diagram.png',
        type: 'image',
        size: 2048000, // 2MB
        url: '/api/files/sample-diagram.png',
        dimensions: { width: 1200, height: 800 },
        metadata: {
          format: 'png',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          processedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
          analysis: {
            text: 'System architecture diagram showing microservices, databases, and API connections',
            objects: ['diagram', 'boxes', 'arrows', 'text', 'database'],
            sentiment: 'neutral',
            confidence: 0.88
          }
        }
      },
      {
        id: '3',
        name: 'team-meeting.mp3',
        type: 'audio',
        size: 5242880, // 5MB
        url: '/api/files/sample-audio.mp3',
        duration: 300,
        metadata: {
          format: 'mp3',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          processedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          analysis: {
            text: 'Team discussing project milestones, upcoming deadlines, and resource allocation...',
            sentiment: 'positive',
            confidence: 0.76
          }
        }
      },
      {
        id: '4',
        name: 'technical-spec.pdf',
        type: 'document',
        size: 1048576, // 1MB
        url: '/api/files/sample-document.pdf',
        metadata: {
          format: 'pdf',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          processedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          analysis: {
            text: 'Technical specification document outlining system requirements, API endpoints, and deployment procedures...',
            sentiment: 'neutral',
            confidence: 0.91
          }
        }
      }
    ];
    
    setFiles(sampleFiles);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    uploadedFiles.forEach(file => {
      const mediaFile: MediaFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: getFileType(file.type),
        size: file.size,
        url: URL.createObjectURL(file),
        metadata: {
          format: file.type.split('/')[1] || 'unknown',
          createdAt: new Date()
        }
      };
      
      setFiles(prev => [...prev, mediaFile]);
      
      // Start processing the file
      processFile(mediaFile);
    });
  };

  const getFileType = (mimeType: string): 'image' | 'video' | 'audio' | 'document' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const processFile = async (file: MediaFile) => {
    const tasks: ProcessingTask[] = [];
    
    // Create processing tasks based on file type
    switch (file.type) {
      case 'image':
        tasks.push({
          id: `${file.id}-object-detection`,
          fileId: file.id,
          type: 'object-detection',
          status: 'pending',
          progress: 0
        });
        tasks.push({
          id: `${file.id}-text-extraction`,
          fileId: file.id,
          type: 'text-extraction',
          status: 'pending',
          progress: 0
        });
        break;
      case 'video':
        tasks.push({
          id: `${file.id}-transcription`,
          fileId: file.id,
          type: 'transcription',
          status: 'pending',
          progress: 0
        });
        tasks.push({
          id: `${file.id}-object-detection`,
          fileId: file.id,
          type: 'object-detection',
          status: 'pending',
          progress: 0
        });
        break;
      case 'audio':
        tasks.push({
          id: `${file.id}-transcription`,
          fileId: file.id,
          type: 'transcription',
          status: 'pending',
          progress: 0
        });
        tasks.push({
          id: `${file.id}-sentiment-analysis`,
          fileId: file.id,
          type: 'sentiment-analysis',
          status: 'pending',
          progress: 0
        });
        break;
      case 'document':
        tasks.push({
          id: `${file.id}-text-extraction`,
          fileId: file.id,
          type: 'text-extraction',
          status: 'pending',
          progress: 0
        });
        break;
    }
    
    setProcessingTasks(prev => [...prev, ...tasks]);
    
    // Simulate processing
    for (const task of tasks) {
      await simulateProcessing(task);
    }
  };

  const simulateProcessing = async (task: ProcessingTask) => {
    // Update task status to processing
    setProcessingTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: 'processing' } : t
    ));
    
    // Simulate progress updates
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProcessingTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, progress } : t
      ));
    }
    
    // Complete the task with mock results
    const mockResult = generateMockResult(task.type);
    setProcessingTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: 'completed', result: mockResult } : t
    ));
    
    // Update the file with analysis results
    setFiles(prev => prev.map(file => 
      file.id === task.fileId ? {
        ...file,
        metadata: {
          ...file.metadata,
          processedAt: new Date(),
          analysis: {
            ...file.metadata.analysis,
            ...mockResult
          }
        }
      } : file
    ));
  };

  const generateMockResult = (taskType: string) => {
    switch (taskType) {
      case 'transcription':
        return {
          text: 'This is a sample transcription of the audio/video content. The AI has processed the speech and converted it to text.',
          confidence: 0.85 + Math.random() * 0.15
        };
      case 'object-detection':
        return {
          objects: ['person', 'computer', 'desk', 'window', 'book'],
          confidence: 0.80 + Math.random() * 0.20
        };
      case 'text-extraction':
        return {
          text: 'Extracted text from the document or image. This includes all readable text found in the file.',
          confidence: 0.90 + Math.random() * 0.10
        };
      case 'sentiment-analysis':
        return {
          sentiment: Math.random() > 0.5 ? 'positive' : Math.random() > 0.5 ? 'negative' : 'neutral',
          confidence: 0.75 + Math.random() * 0.25
        };
      default:
        return {};
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioFile: MediaFile = {
          id: Date.now().toString(),
          name: `recording-${new Date().toISOString().slice(0, 16)}.webm`,
          type: 'audio',
          size: blob.size,
          url: URL.createObjectURL(blob),
          metadata: {
            format: 'webm',
            createdAt: new Date()
          }
        };
        
        setFiles(prev => [...prev, audioFile]);
        processFile(audioFile);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setRecordingTime(0);
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const searchFiles = (query: string) => {
    if (!query.trim()) return files;
    
    return files.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase()) ||
      file.metadata.analysis?.text?.toLowerCase().includes(query.toLowerCase()) ||
      file.metadata.analysis?.objects?.some(obj => 
        obj.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-6 w-6 text-blue-500" />;
      case 'video': return <Video className="h-6 w-6 text-red-500" />;
      case 'audio': return <Music className="h-6 w-6 text-green-500" />;
      case 'document': return <FileText className="h-6 w-6 text-purple-500" />;
      default: return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredFiles = searchFiles(searchQuery);
  const activeTasks = processingTasks.filter(task => task.status === 'processing');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Multi-Modal AI Support</h2>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Files
          </Button>
          <Button
            variant="outline"
            onClick={isRecording ? stopRecording : startRecording}
            className="flex items-center gap-2"
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4" />
                Stop ({formatDuration(recordingTime)})
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Record
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search files by name, content, or objects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Files</p>
                <p className="text-2xl font-bold">{files.length}</p>
              </div>
              <File className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold">{activeTasks.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Tasks */}
      {activeTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Processing Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    <div>
                      <p className="font-medium">{task.type.replace(/-/g, ' ')}</p>
                      <p className="text-sm text-gray-600">
                        {files.find(f => f.id === task.fileId)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={task.progress} className="w-20" />
                    <span className="text-sm font-medium w-12">{task.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file) => (
          <Card 
            key={file.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedFile?.id === file.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedFile(file)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon(file.type)}
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <Badge variant="secondary">{file.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{formatFileSize(file.size)}</span>
                  {file.duration && <span>{formatDuration(file.duration)}</span>}
                </div>
                
                {file.metadata.analysis && (
                  <div className="space-y-1">
                    {file.metadata.analysis.text && (
                      <p className="text-xs text-gray-700 line-clamp-2">
                        {file.metadata.analysis.text}
                      </p>
                    )}
                    {file.metadata.analysis.objects && (
                      <div className="flex flex-wrap gap-1">
                        {file.metadata.analysis.objects.slice(0, 3).map((obj, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {obj}
                          </Badge>
                        ))}
                        {file.metadata.analysis.objects.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{file.metadata.analysis.objects.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* File Details */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getFileIcon(selectedFile.type)}
              {selectedFile.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">File Information</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{formatFileSize(selectedFile.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span>{selectedFile.metadata.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{selectedFile.metadata.createdAt.toLocaleDateString()}</span>
                  </div>
                  {selectedFile.metadata.processedAt && (
                    <div className="flex justify-between">
                      <span>Processed:</span>
                      <span>{selectedFile.metadata.processedAt.toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedFile.duration && (
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{formatDuration(selectedFile.duration)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedFile.metadata.analysis && (
                <div>
                  <h4 className="font-medium mb-2">AI Analysis</h4>
                  <div className="space-y-2">
                    {selectedFile.metadata.analysis.text && (
                      <div>
                        <p className="text-sm font-medium">Extracted Text:</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {selectedFile.metadata.analysis.text}
                        </p>
                      </div>
                    )}
                    {selectedFile.metadata.analysis.objects && (
                      <div>
                        <p className="text-sm font-medium">Detected Objects:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedFile.metadata.analysis.objects.map((obj, index) => (
                            <Badge key={index} variant="outline">
                              {obj}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedFile.metadata.analysis.sentiment && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Sentiment:</span>
                        <Badge variant={
                          selectedFile.metadata.analysis.sentiment === 'positive' ? 'default' :
                          selectedFile.metadata.analysis.sentiment === 'negative' ? 'destructive' : 'secondary'
                        }>
                          {selectedFile.metadata.analysis.sentiment}
                        </Badge>
                      </div>
                    )}
                    {selectedFile.metadata.analysis.confidence && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Confidence:</span>
                        <Progress value={selectedFile.metadata.analysis.confidence * 100} className="w-20" />
                        <span className="text-sm">{Math.round(selectedFile.metadata.analysis.confidence * 100)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}