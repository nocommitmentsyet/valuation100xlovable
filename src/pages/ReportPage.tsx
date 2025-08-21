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
  investment_score: number;
  fair_value: number;
  current_price: number;
  recommendation: "Buy" | "Sell" | "Hold";
  confidence: string;
  summary: string;
  detailed_analysis: {
    investment_thesis: string;
    key_drivers: string[];
    financial_analysis: string;
    scenario_analysis: string;
    risks: string[];
  };
  created_at: string;
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
      
      // Mock data for demo purposes
      setReportData({
        analysis_id: analysisId,
        ticker: "DEMO",
        company_name: "Demo Corporation",
        investment_score: 7.2,
        fair_value: 150.00,
        current_price: 125.50,
        recommendation: "Buy",
        confidence: "High",
        summary: "Based on comprehensive analysis, this stock shows strong fundamentals with significant upside potential. The company demonstrates solid financial performance and strategic positioning in its market segment.",
        detailed_analysis: {
          investment_thesis: "The company shows strong competitive advantages and growth potential in the expanding market...",
          key_drivers: [
            "Strong revenue growth trajectory",
            "Expanding market share",
            "Efficient cost management",
            "Strategic partnerships"
          ],
          financial_analysis: "The company demonstrates solid financial metrics with improving margins and strong cash flow generation...",
          scenario_analysis: "Bull case scenario projects 35% upside, base case shows 20% upside, while bear case suggests limited downside risk...",
          risks: [
            "Market volatility impact",
            "Regulatory changes",
            "Competition intensification",
            "Economic downturn effects"
          ]
        },
        created_at: new Date().toISOString()
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

Investment Score: ${reportData.investment_score}/10
Recommendation: ${reportData.recommendation}
Fair Value: $${reportData.fair_value}
Current Price: $${reportData.current_price}
Upside: ${calculateUpside(reportData.fair_value, reportData.current_price).toFixed(1)}%

Executive Summary:
${reportData.summary}

Generated on: ${new Date(reportData.created_at).toLocaleDateString()}
    `.trim();

    navigator.clipboard.writeText(reportText);
    toast({
      title: "Report Copied",
      description: "Report summary copied to clipboard",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!reportData) return;
    
    const reportContent = `# ${reportData.company_name} (${reportData.ticker}) - Investment Report

## Investment Overview
- **Investment Score**: ${reportData.investment_score}/10
- **Recommendation**: ${reportData.recommendation}
- **Fair Value**: $${reportData.fair_value}
- **Current Price**: $${reportData.current_price}
- **Upside Potential**: ${calculateUpside(reportData.fair_value, reportData.current_price).toFixed(1)}%
- **Confidence**: ${reportData.confidence}

## Executive Summary
${reportData.summary}

## Investment Thesis
${reportData.detailed_analysis.investment_thesis}

## Key Value Drivers
${reportData.detailed_analysis.key_drivers.map(driver => `- ${driver}`).join('\n')}

## Financial Analysis
${reportData.detailed_analysis.financial_analysis}

## Scenario Analysis
${reportData.detailed_analysis.scenario_analysis}

## Key Risks
${reportData.detailed_analysis.risks.map(risk => `- ${risk}`).join('\n')}

---
*Report generated on ${new Date(reportData.created_at).toLocaleDateString()}*
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

  const upside = calculateUpside(reportData.fair_value, reportData.current_price);

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
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-2 ${getScoreBackground(reportData.investment_score)}`}>
                    <span className={`text-3xl font-bold ${getScoreColor(reportData.investment_score)}`}>
                      {reportData.investment_score}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Investment Score</p>
                </div>
                
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xl ${getRecommendationColor(reportData.recommendation)}`}>
                    {getRecommendationIcon(reportData.recommendation)}
                    {reportData.recommendation.toUpperCase()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{reportData.confidence} Confidence</p>
                </div>
              </div>

              {/* Right Side - Price Comparison */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-card rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                    <p className="text-2xl font-bold">${reportData.current_price}</p>
                  </div>
                  <div className="text-center p-4 bg-card rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Fair Value</p>
                    <p className="text-2xl font-bold text-success">${reportData.fair_value}</p>
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
            <p className="text-lg leading-relaxed text-foreground">{reportData.summary}</p>
          </Card>

          {/* Detailed Analysis Sections */}
          <div className="space-y-4">
            {/* Investment Thesis */}
            <Card className="shadow-floating">
              <Collapsible 
                open={expandedSections.thesis} 
                onOpenChange={() => toggleSection('thesis')}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-6 h-auto text-left"
                  >
                    <h3 className="text-xl font-semibold">Investment Thesis</h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.thesis ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6">
                  <p className="text-foreground leading-relaxed">{reportData.detailed_analysis.investment_thesis}</p>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Key Value Drivers */}
            <Card className="shadow-floating">
              <Collapsible 
                open={expandedSections.drivers} 
                onOpenChange={() => toggleSection('drivers')}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-6 h-auto text-left"
                  >
                    <h3 className="text-xl font-semibold">Key Value Drivers</h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.drivers ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6">
                  <ul className="space-y-2">
                    {reportData.detailed_analysis.key_drivers.map((driver, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span className="text-foreground">{driver}</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Financial Analysis */}
            <Card className="shadow-floating">
              <Collapsible 
                open={expandedSections.financial} 
                onOpenChange={() => toggleSection('financial')}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-6 h-auto text-left"
                  >
                    <h3 className="text-xl font-semibold">Financial Analysis</h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.financial ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6">
                  <p className="text-foreground leading-relaxed">{reportData.detailed_analysis.financial_analysis}</p>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Scenario Analysis */}
            <Card className="shadow-floating">
              <Collapsible 
                open={expandedSections.scenario} 
                onOpenChange={() => toggleSection('scenario')}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-6 h-auto text-left"
                  >
                    <h3 className="text-xl font-semibold">Scenario Analysis</h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.scenario ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6">
                  <p className="text-foreground leading-relaxed">{reportData.detailed_analysis.scenario_analysis}</p>
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
                    {reportData.detailed_analysis.risks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-destructive rounded-full mt-2 shrink-0" />
                        <span className="text-foreground">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>

          {/* Disclaimer */}
          <Card className="p-6 bg-muted/30 border-muted">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Disclaimer:</strong> This report is for informational purposes only and does not constitute financial advice. 
              Past performance does not guarantee future results. Please conduct your own research and consult with a financial advisor before making investment decisions.
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Report generated on {new Date(reportData.created_at).toLocaleDateString()} • Analysis ID: {reportData.analysis_id}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;