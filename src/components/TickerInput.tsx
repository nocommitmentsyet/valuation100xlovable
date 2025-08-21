import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, TrendingUp } from "lucide-react";
interface CompanyPreview {
  symbol: string;
  name: string;
  sector: string;
  price: string;
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
  const handleTickerChange = async (value: string) => {
    const upperValue = value.toUpperCase();
    setTicker(upperValue);
    if (upperValue.length >= 2) {
      setIsValidating(true);
      // Simulate API call delay
      setTimeout(() => {
        setPreview(mockPreview(upperValue));
        setIsValidating(false);
      }, 500);
    } else {
      setPreview(null);
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
          
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Get a detailed valuation report using Aswath Damodaran methodology in 15 minutes</h1>
        </div>
        <p className="text-lg text-muted-foreground">Get institutional-grade stock valuation reports in 15 minutes</p>
      </div>

      {/* Input Section */}
      <Card className="p-8 shadow-floating border-0 bg-gradient-subtle">
        
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