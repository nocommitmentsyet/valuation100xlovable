import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface CompanyPreview {
  symbol: string;
  name: string;
  sector: string;
  price: string;
}

interface ValidationResponse {
  is_valid: boolean;
  symbol: string;
  name?: string;
  sector?: string;
  current_price?: number;
  error?: string;
}
interface TickerInputProps {
  onStartAnalysis: (ticker: string) => void;
}
export const TickerInput = ({
  onStartAnalysis
}: TickerInputProps) => {
  const [ticker, setTicker] = useState("");
  const [preview, setPreview] = useState<CompanyPreview | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const validateTicker = async (symbol: string): Promise<ValidationResponse | null> => {
    try {
      const response = await fetch(`https://valuation100x-production.up.railway.app/api/validate/ticker/${symbol}`);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Validation API error:', error);
      return null;
    }
  };
  const handleTickerChange = async (value: string) => {
    const upperValue = value.toUpperCase();
    setTicker(upperValue);
    
    if (upperValue.length >= 2) {
      setIsValidating(true);
      
      const validationResult = await validateTicker(upperValue);
      
      if (validationResult?.is_valid) {
        setPreview({
          symbol: validationResult.symbol,
          name: validationResult.name || `${upperValue} Corporation`,
          sector: validationResult.sector || "Unknown",
          price: validationResult.current_price ? `$${validationResult.current_price.toFixed(2)}` : "$0.00"
        });
      } else {
        setPreview(null);
      }
      
      setIsValidating(false);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!ticker) return;
    
    setIsAnalyzing(true);
    
    // Validate ticker before starting analysis
    const validationResult = await validateTicker(ticker);
    
    if (validationResult?.is_valid) {
      // Proceed with analysis
      onStartAnalysis(ticker);
    } else {
      // Show error toast
      toast({
        variant: "destructive",
        title: "Invalid ticker symbol",
        description: "Please enter a valid stock ticker symbol."
      });
    }
    
    setIsAnalyzing(false);
  };
  return <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          
          <h1 className="text-3xl font-bold text-center">Enter Stock Ticker</h1>
        </div>
        <p className="text-lg text-muted-foreground">Get institutional-grade stock valuation reports in 15 minutes</p>
      </div>

      {/* Input Section */}
      <Card className="p-8 shadow-floating border-0 bg-gradient-subtle">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="ticker" value={ticker} onChange={e => handleTickerChange(e.target.value)} placeholder="e.g., TSLA, AAPL, MSFT" className="pl-10 h-14 text-lg border-2 transition-smooth focus:border-primary" autoComplete="off" />
            </div>
          </div>

          {/* Company Preview */}
          {isValidating && <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>}

          {preview && !isValidating && <div className="p-4 bg-card rounded-lg border shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{preview.name}</h3>
                  <p className="text-sm text-muted-foreground">{preview.sector}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{preview.price}</p>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                </div>
              </div>
            </div>}

          {/* Start Analysis Button */}
          <Button onClick={handleSubmit} disabled={!ticker || isValidating || isAnalyzing} className="w-full h-14 text-lg bg-gradient-primary hover:opacity-90 transition-smooth shadow-floating disabled:opacity-100 disabled:bg-gradient-primary">
            {isAnalyzing ? "Validating & Starting Analysis..." : "Start Deep Analysis"}
          </Button>
        </div>
      </Card>

      {/* Popular Stocks */}
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">Popular stocks to research:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["TSLA", "AAPL", "MSFT", "GOOGL", "NVDA"].map(symbol => <Button key={symbol} variant="outline" size="sm" onClick={() => handleTickerChange(symbol)} className="transition-smooth hover:bg-accent">
              {symbol}
            </Button>)}
        </div>
      </div>
    </div>;
};