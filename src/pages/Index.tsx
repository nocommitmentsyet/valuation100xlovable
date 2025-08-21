import { useState } from "react";
import { TickerInput } from "@/components/TickerInput";
import { ProgressTracker } from "@/components/ProgressTracker";
import { ResearchReport } from "@/components/ResearchReport";

type AppState = "input" | "analysis" | "report";

interface ReportData {
  ticker: string;
  recommendation: "Buy" | "Sell" | "Hold";
  intrinsicValue: number;
  currentPrice: number;
  upside: number;
  confidence: string;
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>("input");
  const [currentTicker, setCurrentTicker] = useState<string>("");
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const handleStartAnalysis = (ticker: string) => {
    setCurrentTicker(ticker);
    setAppState("analysis");
  };

  const handleAnalysisComplete = (data: ReportData) => {
    setReportData(data);
    setAppState("report");
  };

  const handleBackToInput = () => {
    setAppState("input");
    setCurrentTicker("");
    setReportData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {appState === "input" && (
          <div className="flex items-center justify-center min-h-[80vh]">
            <TickerInput onStartAnalysis={handleStartAnalysis} />
          </div>
        )}
        
        {appState === "analysis" && (
          <div className="py-8">
            <ProgressTracker 
              ticker={currentTicker} 
              onComplete={handleAnalysisComplete} 
            />
          </div>
        )}
        
        {appState === "report" && reportData && (
          <div className="py-8">
            <ResearchReport 
              reportData={reportData} 
              onBack={handleBackToInput} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
