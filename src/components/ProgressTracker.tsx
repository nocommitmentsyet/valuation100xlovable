import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Loader2, FileText, Calculator, Brain, TrendingUp, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "running" | "completed" | "error";
  icon: any;
  estimatedTime: number;
  logs: string[];
}

interface ProgressTrackerProps {
  ticker: string;
  onComplete: (reportData: any) => void;
}

export const ProgressTracker = ({ ticker, onComplete }: ProgressTrackerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const statusPollingRef = useRef<NodeJS.Timeout | null>(null);

  const steps: AnalysisStep[] = [
    {
      id: "data-collection",
      title: "Collecting Financial Data",
      description: "Gathering SEC filings, financial statements, and market data",
      status: "pending",
      icon: FileText,
      estimatedTime: 180,
      logs: []
    },
    {
      id: "financial-analysis",
      title: "Analyzing Financials",
      description: "Processing income statements, balance sheets, and cash flows",
      status: "pending",
      icon: Calculator,
      estimatedTime: 240,
      logs: []
    },
    {
      id: "story-building",
      title: "Building Damodaran Story",
      description: "Creating growth narrative and identifying key value drivers",
      status: "pending",
      icon: Brain,
      estimatedTime: 300,
      logs: []
    },
    {
      id: "valuation",
      title: "Running Valuation Models",
      description: "DCF modeling with scenario analysis and sensitivity testing",
      status: "pending",
      icon: TrendingUp,
      estimatedTime: 180,
      logs: []
    }
  ];

  const [analysisSteps, setAnalysisSteps] = useState(steps);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
      
      // Update progress based on current step
      const totalSteps = analysisSteps.length;
      const completedSteps = analysisSteps.filter(step => step.status === "completed").length;
      const runningStepProgress = currentStep < totalSteps ? 25 : 0; // Partial progress for running step
      
      const newProgress = (completedSteps / totalSteps) * 100 + (runningStepProgress / totalSteps);
      setProgress(Math.min(newProgress, 95)); // Cap at 95% until complete
      
      // Update estimated time remaining
      if (completedSteps > 0) {
        const avgTimePerStep = timeElapsed / Math.max(completedSteps, 1);
        const remainingSteps = totalSteps - completedSteps;
        setEstimatedTimeRemaining(Math.max(0, remainingSteps * avgTimePerStep));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, analysisSteps, timeElapsed]);

  // Get analysis ID from TickerInput component
  useEffect(() => {
    const startAnalysis = async () => {
      try {
        const response = await fetch('https://valuation100x-production.up.railway.app/api/analysis/comprehensive/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticker: ticker
          })
        });
        
        if (!response.ok) {
          throw new Error(`Analysis API error: ${response.status}`);
        }
        
        const data = await response.json();
        setAnalysisId(data.analysis_id);
        
        // Start status polling
        startStatusPolling(data.analysis_id);
        
      } catch (error) {
        console.error('Failed to start analysis:', error);
        toast({
          title: "Analysis Failed",
          description: "Unable to start analysis. Please try again.",
          variant: "destructive",
        });
      }
    };

    startAnalysis();
    
    return () => {
      // Cleanup
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
      }
    };
  }, [ticker, toast]);

  const startStatusPolling = (id: string) => {
    statusPollingRef.current = setInterval(async () => {
      try {
        const response = await fetch(`https://valuation100x-production.up.railway.app/api/analysis/${id}/status`);
        const data = await response.json();
        
        updateAnalysisState(data);
        
        // If analysis is complete, get results
        if (data.status === 'completed') {
          const resultsResponse = await fetch(`https://valuation100x-production.up.railway.app/api/analysis/${id}/results`);
          const results = await resultsResponse.json();
          
          setProgress(100);
          onComplete(results);
          
          if (statusPollingRef.current) {
            clearInterval(statusPollingRef.current);
          }
        }
        
        // If analysis failed, stop polling
        if (data.status === 'failed' || data.status === 'cancelled') {
          if (statusPollingRef.current) {
            clearInterval(statusPollingRef.current);
          }
          
          toast({
            title: data.status === 'cancelled' ? "Analysis Cancelled" : "Analysis Failed",
            description: data.error_message || "The analysis was stopped.",
            variant: "destructive",
          });
        }
        
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 2000); // Poll every 2 seconds
  };

  const updateAnalysisState = (statusData: any) => {
    // Map API status to our step structure
    const stepMapping: Record<string, number> = {
      'data-collection': 0,
      'financial-analysis': 1,
      'story-building': 2,
      'valuation': 3
    };

    const currentStepIndex = stepMapping[statusData.current_step] ?? 0;
    setCurrentStep(currentStepIndex);

    // Update progress
    setProgress(statusData.progress_percentage || 0);

    // Update steps status
    setAnalysisSteps(prev => prev.map((step, index) => {
      if (index < currentStepIndex) {
        return { ...step, status: "completed" as const };
      } else if (index === currentStepIndex) {
        return { 
          ...step, 
          status: "running" as const,
          logs: statusData.logs || step.logs
        };
      } else {
        return { ...step, status: "pending" as const };
      }
    }));
  };

  const cancelAnalysis = async () => {
    if (!analysisId || isCancelling) return;

    setIsCancelling(true);
    
    try {
      const response = await fetch(`https://valuation100x-production.up.railway.app/api/analysis/${analysisId}/cancel`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "Analysis Cancelled",
          description: "The analysis has been stopped successfully.",
        });
        
        // Clear polling
        if (statusPollingRef.current) {
          clearInterval(statusPollingRef.current);
        }
      } else {
        throw new Error('Failed to cancel analysis');
      }
    } catch (error) {
      toast({
        title: "Cancel Failed",
        description: "Unable to cancel the analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-muted" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Analyzing {ticker}</h1>
            <p className="text-muted-foreground">
              Generating institutional-grade research report using Damodaran methodology
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={cancelAnalysis}
            disabled={isCancelling || !analysisId}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            {isCancelling ? "Cancelling..." : "Cancel Analysis"}
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="p-6 shadow-floating">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Time Elapsed: {formatTime(timeElapsed)}</span>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">
                Est. Remaining: {formatTime(estimatedTimeRemaining)}
              </span>
            </div>
          </div>
          
          <Progress value={progress} className="h-3" />
          
          <div className="text-center">
            <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
            <span className="text-muted-foreground ml-2">Complete</span>
          </div>
        </div>
      </Card>

      {/* Analysis Steps */}
      <div className="space-y-4">
        {analysisSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          
          return (
            <Card 
              key={step.id} 
              className={`p-6 transition-smooth ${
                isActive ? 'border-primary shadow-floating' : 'shadow-card'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(step.status)}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">{step.title}</h3>
                    </div>
                    <Badge 
                      variant={step.status === "completed" ? "default" : step.status === "running" ? "secondary" : "outline"}
                    >
                      {step.status === "running" ? "In Progress" : step.status}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground">{step.description}</p>
                  
                  {/* Live Logs */}
                  {step.logs.length > 0 && (
                    <div className="mt-3 p-3 bg-muted rounded-lg font-mono text-sm space-y-1">
                      {step.logs.map((log, logIndex) => (
                        <div key={logIndex} className="text-muted-foreground">
                          <span className="text-success">✓</span> {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};