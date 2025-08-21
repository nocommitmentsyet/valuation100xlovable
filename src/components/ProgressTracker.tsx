import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Loader2, FileText, Calculator, Brain, TrendingUp, AlertCircle } from "lucide-react";

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

  useEffect(() => {
    // Simulate the analysis process
    const runAnalysis = async () => {
      for (let i = 0; i < analysisSteps.length; i++) {
        // Mark current step as running
        setCurrentStep(i);
        setAnalysisSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? "running" : index < i ? "completed" : "pending"
        })));

        // Simulate step execution with logs
        await new Promise(resolve => {
          const stepDuration = analysisSteps[i].estimatedTime * 1000;
          const logInterval = stepDuration / 3;
          
          let logCount = 0;
          const logTimer = setInterval(() => {
            const mockLogs = {
              "data-collection": [
                "Fetching 10-K and 10-Q filings from SEC EDGAR...",
                "Downloading quarterly financial statements...",
                "Collecting real-time market data and analyst estimates..."
              ],
              "financial-analysis": [
                "Processing income statement trends over 5 years...",
                "Analyzing balance sheet strength and debt levels...",
                "Calculating key financial ratios and metrics..."
              ],
              "story-building": [
                "Identifying primary growth drivers and competitive moats...",
                "Analyzing market opportunity and addressable market...",
                "Building Damodaran-style growth narrative..."
              ],
              "valuation": [
                "Running DCF model with multiple scenarios...",
                "Performing sensitivity analysis on key assumptions...",
                "Calculating intrinsic value and margin of safety..."
              ]
            };

            const logs = mockLogs[analysisSteps[i].id as keyof typeof mockLogs] || [];
            
            if (logCount < logs.length) {
              setAnalysisSteps(prev => prev.map((step, index) => ({
                ...step,
                logs: index === i ? [...step.logs, logs[logCount]] : step.logs
              })));
              logCount++;
            } else {
              clearInterval(logTimer);
            }
          }, logInterval);

          setTimeout(() => {
            clearInterval(logTimer);
            resolve(void 0);
          }, stepDuration);
        });

        // Mark step as completed
        setAnalysisSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? "completed" : step.status
        })));
      }

      // Complete the analysis
      setProgress(100);
      setTimeout(() => {
        onComplete({
          ticker,
          recommendation: "Buy",
          intrinsicValue: 285.50,
          currentPrice: 248.42,
          upside: 14.9,
          confidence: "High"
        });
      }, 1000);
    };

    runAnalysis();
  }, [ticker, onComplete, analysisSteps]);

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
        <h1 className="text-3xl font-bold">Analyzing {ticker}</h1>
        <p className="text-muted-foreground">
          Generating institutional-grade research report using Damodaran methodology
        </p>
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