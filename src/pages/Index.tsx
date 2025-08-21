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
          <>
            <div className="flex items-center justify-center min-h-[80vh]">
              <TickerInput onStartAnalysis={handleStartAnalysis} />
            </div>
            
            {/* How It Works */}
            <section className="py-16 bg-card">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold text-primary-foreground">1</span>
                    </div>
                    <h3 className="font-semibold text-lg">Enter Ticker</h3>
                    <p className="text-muted-foreground">Enter a stock ticker (e.g., TSLA) and we'll validate the company.</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold text-primary-foreground">2</span>
                    </div>
                    <h3 className="font-semibold text-lg">Deep Analysis</h3>
                    <p className="text-muted-foreground">We analyze financials, filings, sentiment, and valuation using the Damodaran framework.</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold text-primary-foreground">3</span>
                    </div>
                    <h3 className="font-semibold text-lg">Professional Report</h3>
                    <p className="text-muted-foreground">Receive a full markdown report with Buy/Sell/Hold recommendation in 15 minutes.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Example Report Preview */}
            <section className="py-16">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Example Report Preview</h2>
                <div className="max-w-3xl mx-auto">
                  <div className="bg-card rounded-lg border shadow-card p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold">Tesla, Inc. (TSLA)</h3>
                        <p className="text-muted-foreground">Electric Vehicle & Clean Energy</p>
                      </div>
                      <div className="bg-success text-success-foreground px-4 py-2 rounded-lg font-bold">
                        BUY
                      </div>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">Current Price</p>
                          <p className="text-2xl font-bold">$248.42</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Intrinsic Value</p>
                          <p className="text-2xl font-bold text-success">$295.00</p>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Executive Summary</h4>
                        <p className="text-muted-foreground">Based on Damodaran valuation methodology, Tesla shows strong fundamentals in the growing EV market with solid execution on production targets...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Why DeepResearch */}
            <section className="py-16 bg-card">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Why DeepResearch?</h2>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                    <div>
                      <h3 className="font-semibold mb-2">Institutional-grade insights in 15 minutes</h3>
                      <p className="text-muted-foreground">Get professional-quality research without waiting days or weeks.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                    <div>
                      <h3 className="font-semibold mb-2">Built on trusted Damodaran methodology</h3>
                      <p className="text-muted-foreground">Uses the proven valuation framework from NYU Stern's Aswath Damodaran.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                    <div>
                      <h3 className="font-semibold mb-2">Clear recommendations</h3>
                      <p className="text-muted-foreground">Simple Buy / Sell / Hold recommendations backed by transparent analysis.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                    <div>
                      <h3 className="font-semibold mb-2">Shareable, professional reports</h3>
                      <p className="text-muted-foreground">Export to PDF or markdown for easy sharing and reference.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="py-16">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">What Users Say</h2>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <div className="bg-card rounded-lg border shadow-card p-6">
                    <p className="text-muted-foreground mb-4">"This saved me 10+ hours per stock. The report feels like it came from a research desk."</p>
                    <p className="font-semibold">— Retail Investor</p>
                  </div>
                  <div className="bg-card rounded-lg border shadow-card p-6">
                    <p className="text-muted-foreground mb-4">"The valuation logic is transparent and trustworthy."</p>
                    <p className="font-semibold">— Finance Enthusiast</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Built For */}
            <section className="py-16 bg-card">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Built For</h2>
                <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Designed for individual investors first, with professional use cases coming soon.
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full font-medium">Individual Investors</span>
                  <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full font-medium">DIY Analysts</span>
                  <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full font-medium">Finance Nerds</span>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t">
              <div className="container mx-auto px-4">
                <div className="flex justify-center space-x-8 mb-6">
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">About</a>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">Security</a>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">Contact</a>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  For demo purposes only — not financial advice.
                </p>
              </div>
            </footer>
          </>
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
