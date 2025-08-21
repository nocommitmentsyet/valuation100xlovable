import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, TrendingUp, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface CompanyPreview {
  symbol: string;
  name: string;
  sector: string;
  price: string;
  exchange?: string;
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
  const { toast } = useToast();
  const mockPreview = (symbol: string): CompanyPreview => {
    const mockData: Record<string, CompanyPreview> = {
      "TSLA": {
        symbol: "TSLA",
        name: "Tesla, Inc.",
        sector: "Consumer Discretionary",
        price: "$248.42"
      },
      "AAPL": {
        symbol: "AAPL",
        name: "Apple Inc.",
        sector: "Technology",
        price: "$192.53"
      },
      "MSFT": {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        sector: "Technology",
        price: "$421.78"
      },
      "GOOGL": {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        sector: "Communication Services",
        price: "$141.52"
      },
      "NVDA": {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        sector: "Technology",
        price: "$462.89"
      }
    };
    return mockData[symbol] || {
      symbol,
      name: `${symbol} Corporation`,
      sector: "Unknown",
      price: "$0.00"
    };
  };
  const handleTickerChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setTicker(upperValue);
    // Clear preview when ticker changes
    setPreview(null);
  };

  const handleValidate = async () => {
    if (!ticker || ticker.length < 1) {
      toast({
        title: "Enter a ticker symbol",
        description: "Please enter a stock ticker to validate",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const response = await fetch(`http://localhost:8000/api/validate/ticker/${ticker}`);
      
      if (response.ok) {
        const data = await response.json();
        setPreview({
          symbol: data.ticker || ticker,
          name: data.company_name || `${ticker} Corporation`,
          sector: data.sector || "Unknown",
          price: data.price || "$0.00",
          exchange: data.exchange
        });
        
        toast({
          title: "✅ Valid Ticker",
          description: `${data.company_name || ticker} (${data.ticker || ticker}) is valid and listed on ${data.exchange || 'exchange'}`,
        });
      } else {
        toast({
          title: "❌ Invalid Ticker",
          description: "Invalid ticker. Try again.",
          variant: "destructive"
        });
        setPreview(null);
      }
    } catch (error) {
      toast({
        title: "❌ Validation Error",
        description: "Unable to validate ticker. Please try again.",
        variant: "destructive"
      });
      setPreview(null);
    } finally {
      setIsValidating(false);
    }
  };
  const handleSubmit = () => {
    if (ticker && preview) {
      onStartAnalysis(ticker);
    }
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
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                id="ticker_input" 
                value={ticker} 
                onChange={e => handleTickerChange(e.target.value)} 
                placeholder="e.g., TSLA, AAPL, MSFT" 
                className="pl-10 h-14 text-lg border-2 transition-smooth focus:border-primary" 
                autoComplete="off" 
              />
            </div>
            
            <Button 
              onClick={handleValidate} 
              disabled={!ticker || isValidating} 
              className="w-full h-12 text-base bg-gradient-primary hover:opacity-90 transition-smooth shadow-floating"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {isValidating ? "Validating..." : "Validate Ticker"}
            </Button>
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
          <Button 
            onClick={handleSubmit} 
            disabled={!preview || isValidating} 
            className="w-full h-14 text-lg bg-gradient-primary hover:opacity-90 transition-smooth shadow-floating"
          >
            Start Deep Analysis
          </Button>
        </div>
      </Card>

      {/* Popular Stocks */}
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">Popular stocks to research:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["TSLA", "AAPL", "MSFT", "GOOGL", "NVDA"].map(symbol => <Button key={symbol} variant="outline" size="sm" onClick={() => {
            handleTickerChange(symbol);
            setTicker(symbol);
          }} className="transition-smooth hover:bg-accent">
              {symbol}
            </Button>)}
        </div>
      </div>
    </div>;
};