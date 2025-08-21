import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronDown, TrendingUp, TrendingDown, Minus, Download, Copy, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportData {
  analysis_id: string;
  ticker: string;
  company_name: string;
  status: string;
  results: {
    investment_score: number;
    fair_value: number;
    current_price: number;
    recommendation: "BUY" | "SELL" | "HOLD";
    confidence: number;
    analysis_summary: {
      executive_summary: string;
      key_strengths: string[];
      key_risks: string[];
      price_target?: number;
    };
  };
  metadata?: {
    analysis_duration: string;
    data_sources: string[];
    model_versions: Record<string, string>;
  };
  completed_at: string;
}

const ReportPage = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const fetchReportData = async () => {
    if (!analysisId) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://valuation100x-production.up.railway.app/api/analysis/${analysisId}/results`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.status}`);
      }

      const data = await response.json();
      setReportData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err instanceof Error ? err.message : 'Failed to load report');
      
      // Mock data for demo purposes - matching actual API structure
      setReportData({
        analysis_id: analysisId,
        ticker: "DEMO",
        company_name: "Demo Corporation",
        status: "completed",
        results: {
          investment_score: 7.2,
          fair_value: 150.00,
          current_price: 125.50,
          recommendation: "BUY",
          confidence: 0.85,
          analysis_summary: {
            executive_summary: "Based on comprehensive analysis, this stock shows strong fundamentals with significant upside potential. The company demonstrates solid financial performance and strategic positioning in its market segment.",
            key_strengths: [
              "Strong revenue growth trajectory",
              "Expanding market share",
              "Efficient cost management",
              "Strategic partnerships"
            ],
            key_risks: [
              "Market volatility impact",
              "Regulatory changes", 
              "Competition intensification",
              "Economic downturn effects"
            ],
            price_target: 175.00
          }
        },
        completed_at: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 5) return "text-destructive";
    if (score < 7) return "text-warning";
    return "text-success";
  };

  const getScoreBackground = (score: number) => {
    if (score < 5) return "bg-destructive/10 border-destructive/20";
    if (score < 7) return "bg-warning/10 border-warning/20";
    return "bg-success/10 border-success/20";
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "Buy":
        return <TrendingUp className="h-5 w-5" />;
      case "Sell":
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <Minus className="h-5 w-5" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Buy":
        return "bg-success text-success-foreground";
      case "Sell":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-warning text-warning-foreground";
    }
  };

  const calculateUpside = (fairValue: number, currentPrice: number) => {
    return ((fairValue - currentPrice) / currentPrice) * 100;
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCopy = () => {
    if (!reportData) return;
    
    const reportText = `
${reportData.company_name} (${reportData.ticker}) - Investment Report

Investment Score: ${reportData.results.investment_score.toFixed(1)}/10
Recommendation: ${reportData.results.recommendation}
Fair Value: $${reportData.results.fair_value.toFixed(2)}
Current Price: $${reportData.results.current_price}
Upside: ${calculateUpside(reportData.results.fair_value, reportData.results.current_price).toFixed(1)}%

Executive Summary:
${reportData.results.analysis_summary.executive_summary}

Generated on: ${new Date(reportData.completed_at).toLocaleDateString()}
    `.trim();

    navigator.clipboard.writeText(reportText);
    toast({
      title: "Report Copied",
      description: "Report summary copied to clipboard",
    });
  };

  const handlePrint = () => {
    window.print(); // Print the current page
  };

  const handleDownload = () => {
    if (!reportData) return;
    
    const reportContent = `# ${reportData.company_name} (${reportData.ticker}) - Investment Report

## Investment Overview
- **Investment Score**: ${reportData.results.investment_score.toFixed(1)}/10
- **Recommendation**: ${reportData.results.recommendation}
- **Fair Value**: $${reportData.results.fair_value.toFixed(2)}
- **Current Price**: $${reportData.results.current_price}
- **Upside Potential**: ${calculateUpside(reportData.results.fair_value, reportData.results.current_price).toFixed(1)}%
- **Confidence**: ${Math.round(reportData.results.confidence * 100)}%

## Executive Summary
${reportData.results.analysis_summary.executive_summary}

## Key Strengths
${reportData.results.analysis_summary.key_strengths.map(strength => `- ${strength}`).join('\n')}

## Key Risks
${reportData.results.analysis_summary.key_risks.map(risk => `- ${risk}`).join('\n')}

${reportData.metadata ? `## Analysis Details
- **Duration**: ${reportData.metadata.analysis_duration}
- **Data Sources**: ${reportData.metadata.data_sources.join(', ')}
` : ''}

---
*Report generated on ${new Date(reportData.completed_at).toLocaleDateString()}*
*This report is for informational purposes only and does not constitute financial advice.*
`;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.ticker}_investment_report_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Report saved as Markdown file",
    });
  };

  useEffect(() => {
    if (!analysisId) {
      navigate('/');
      return;
    }
    fetchReportData();
  }, [analysisId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-48" />
            <Card className="p-6">
              <Skeleton className="h-32 w-full" />
            </Card>
            <Card className="p-6">
              <Skeleton className="h-48 w-full" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Report Not Found</h2>
              <p className="text-muted-foreground mb-4">
                {error || "The requested report could not be found."}
              </p>
              <Button onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const upside = calculateUpside(reportData.results.fair_value, reportData.results.current_price);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={() => navigate('/')}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-2">
            <Button onClick={handleCopy} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">{reportData.company_name}</h1>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-mono text-muted-foreground">({reportData.ticker})</span>
              <Badge variant="outline">Investment Report</Badge>
            </div>
          </div>

          {/* Investment Overview */}
          <Card className="p-8 shadow-floating">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Side - Score & Recommendation */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-2 ${getScoreBackground(reportData.results.investment_score)}`}>
                    <span className={`text-3xl font-bold ${getScoreColor(reportData.results.investment_score)}`}>
                      {reportData.results.investment_score.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Investment Score</p>
                </div>
                
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xl ${getRecommendationColor(reportData.results.recommendation)}`}>
                    {getRecommendationIcon(reportData.results.recommendation)}
                    {reportData.results.recommendation?.toUpperCase() || 'LOADING'}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{Math.round(reportData.results.confidence * 100)}% Confidence</p>
                </div>
              </div>

              {/* Right Side - Price Comparison */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-card rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                    <p className="text-2xl font-bold">${reportData.results.current_price}</p>
                  </div>
                  <div className="text-center p-4 bg-card rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Fair Value</p>
                    <p className="text-2xl font-bold text-success">${reportData.results.fair_value.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-sm text-muted-foreground mb-1">Upside Potential</p>
                  <p className="text-3xl font-bold text-success">+{upside.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Executive Summary */}
          <Card className="p-6 shadow-floating">
            <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
            <p className="text-lg leading-relaxed text-foreground">{reportData.results.analysis_summary.executive_summary}</p>
          </Card>

          {/* Detailed Analysis Sections */}
          <div className="space-y-4">
            {/* Key Strengths */}
            <Card className="shadow-floating">
              <Collapsible 
                open={expandedSections.strengths} 
                onOpenChange={() => toggleSection('strengths')}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-6 h-auto text-left"
                  >
                    <h3 className="text-xl font-semibold">Key Strengths</h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.strengths ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6">
                  <ul className="space-y-2">
                    {reportData.results.analysis_summary.key_strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-success rounded-full mt-2 shrink-0" />
                        <span className="text-foreground">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Key Risks */}
            <Card className="shadow-floating">
              <Collapsible 
                open={expandedSections.risks} 
                onOpenChange={() => toggleSection('risks')}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-6 h-auto text-left"
                  >
                    <h3 className="text-xl font-semibold">Key Risks</h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.risks ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6">
                  <ul className="space-y-2">
                    {reportData.results.analysis_summary.key_risks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-destructive rounded-full mt-2 shrink-0" />
                        <span className="text-foreground">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Analysis Metadata */}
            {reportData.metadata && (
              <Card className="shadow-floating">
                <Collapsible 
                  open={expandedSections.metadata} 
                  onOpenChange={() => toggleSection('metadata')}
                >
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between p-6 h-auto text-left"
                    >
                      <h3 className="text-xl font-semibold">Analysis Details</h3>
                      <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.metadata ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-6 pb-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Analysis Duration</h4>
                        <p className="text-foreground">{reportData.metadata.analysis_duration}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Data Sources</h4>
                        <ul className="space-y-1">
                          {reportData.metadata.data_sources.map((source, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              <span className="text-foreground">{source}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}
          </div>


          {/* Disclaimer */}
          <Card className="p-6 bg-muted/30 border-muted">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Disclaimer:</strong> This report is for informational purposes only and does not constitute financial advice. 
              Past performance does not guarantee future results. Please conduct your own research and consult with a financial advisor before making investment decisions.
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Report generated on {new Date(reportData.completed_at).toLocaleDateString()} • Analysis ID: {reportData.analysis_id}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;