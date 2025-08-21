import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProgressMessage {
  id: string;
  timestamp: string;
  message: string;
  percentage?: number;
}

const AnalysisProgress = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<ProgressMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const addMessage = (message: string, percentage?: number) => {
    const newMessage: ProgressMessage = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: formatTimestamp(new Date()),
      message,
      percentage
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }
    }, 100);
  };

  const connectWebSocket = () => {
    if (!analysisId) return;

    try {
      const wsUrl = `wss://valuation100x-production.up.railway.app/ws/analysis/${analysisId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setHasError(false);
        retryCount.current = 0;
        addMessage("Connected to analysis stream...");
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "progress") {
            const percentage = data.data?.percentage || data.percentage;
            const message = data.data?.message || data.message;
            
            if (percentage !== undefined) {
              setProgress(percentage);
            }
            
            if (message) {
              addMessage(message, percentage);
            }
          } else if (data.type === "completion") {
            addMessage("Analysis completed! Redirecting to report...");
            setProgress(100);
            
            // Close WebSocket and redirect after a short delay
            setTimeout(() => {
              if (wsRef.current) {
                wsRef.current.close();
              }
              navigate(`/report/${data.data?.analysis_id || analysisId}`);
            }, 2000);
          } else if (data.type === "error") {
            addMessage(`Error: ${data.message || 'Analysis failed'}`);
            setHasError(true);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          addMessage('Error parsing server message');
        }
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        
        if (event.code !== 1000 && retryCount.current < maxRetries) {
          // Unexpected closure, attempt to reconnect
          retryCount.current++;
          addMessage(`Connection lost. Retrying... (${retryCount.current}/${maxRetries})`);
          
          retryTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 2000 * retryCount.current); // Exponential backoff
        } else if (retryCount.current >= maxRetries) {
          addMessage('Connection failed after multiple attempts. Please try again.');
          setHasError(true);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        addMessage('Connection error occurred');
        setHasError(true);
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      addMessage('Failed to connect to analysis stream');
      setHasError(true);
    }
  };

  const handleCancel = async () => {
    if (!analysisId || isCancelling) return;
    
    setIsCancelling(true);
    
    try {
      const response = await fetch(
        `https://valuation100x-production.up.railway.app/api/analysis/${analysisId}/cancel`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        addMessage("Analysis cancelled by user");
        
        // Close WebSocket
        if (wsRef.current) {
          wsRef.current.close(1000, "User cancelled");
        }
        
        toast({
          title: "Analysis Cancelled",
          description: "The analysis has been stopped successfully.",
        });
        
        // Navigate back after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        const errorData = await response.json();
        addMessage(`Failed to cancel: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Cancel error:', error);
      addMessage('Failed to cancel analysis');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleBack = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, "User navigated away");
    }
    navigate('/');
  };

  useEffect(() => {
    if (!analysisId) {
      navigate('/');
      return;
    }

    addMessage("Initializing analysis...");
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [analysisId]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={handleBack}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-muted'}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Analysis in Progress</h1>
            <p className="text-muted-foreground">
              Analysis ID: <span className="font-mono">{analysisId}</span>
            </p>
          </div>

          {/* Progress Section */}
          <Card className="p-6 shadow-floating">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Progress</h2>
                <Button 
                  onClick={handleCancel}
                  disabled={isCancelling || hasError}
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  {isCancelling ? 'Cancelling...' : 'Cancel Analysis'}
                </Button>
              </div>
              
              <Progress value={progress} className="h-3" />
              
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
                <span className="text-muted-foreground ml-2">Complete</span>
              </div>
            </div>
          </Card>

          {/* Messages Feed */}
          <Card className="p-6 shadow-floating">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Live Updates</h2>
              
              <ScrollArea ref={scrollAreaRef} className="h-96 w-full border rounded-md p-4 bg-card">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-3 text-sm">
                      <span className="text-muted-foreground font-mono text-xs shrink-0 mt-0.5">
                        {msg.timestamp}
                      </span>
                      <div className="flex-1">
                        <span className="text-foreground">{msg.message}</span>
                        {msg.percentage !== undefined && (
                          <span className="ml-2 text-primary font-medium">
                            ({msg.percentage}%)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      Waiting for updates...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </Card>

          {/* Error State */}
          {hasError && (
            <Card className="p-6 border-destructive bg-destructive/5">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-destructive">Connection Issues</h3>
                <p className="text-muted-foreground">
                  There was a problem connecting to the analysis stream. 
                  You can try refreshing the page or starting a new analysis.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Refresh Page
                  </Button>
                  <Button onClick={handleBack}>
                    Start New Analysis
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgress;