import { Gravity, MatterBody } from "@/components/ui/gravity";
import { ChevronDown } from "lucide-react";
export const HeroSection = () => {
  return <div className="w-full min-h-[80vh] relative overflow-hidden bg-gradient-subtle">
      <div className="pt-32 text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground w-full text-center font-bold">
        DeepResearch
      </div>
      <p className="pt-6 text-lg sm:text-xl md:text-2xl text-muted-foreground w-full text-center max-w-3xl mx-auto px-4">
        Institutional-grade stock analysis in 15 minutes using Damodaran methodology
      </p>
      <Gravity gravity={{
      x: 0,
      y: 0.8
    }} className="w-full h-full" addTopWall={false}>
        <MatterBody matterBodyOptions={{
        friction: 0.3,
        restitution: 0.4,
        density: 0.002
      }} x="20%" y="5%">
          <div className="text-sm sm:text-base md:text-lg bg-primary text-primary-foreground rounded-full hover:cursor-grab px-4 py-2 font-medium shadow-sm">
            Financial Analysis
          </div>
        </MatterBody>
        <MatterBody matterBodyOptions={{
        friction: 0.3,
        restitution: 0.4,
        density: 0.002
      }} x="30%" y="10%">
          <div className="text-sm sm:text-base md:text-lg bg-accent text-accent-foreground rounded-full hover:cursor-grab px-4 py-2 font-medium shadow-sm">
            DCF Valuation
          </div>
        </MatterBody>
        <MatterBody matterBodyOptions={{
        friction: 0.3,
        restitution: 0.4,
        density: 0.002
      }} x="75%" y="5%" angle={-15}>
          <div className="text-sm sm:text-base md:text-lg bg-secondary text-secondary-foreground rounded-full hover:cursor-grab px-4 py-2 font-medium shadow-sm">
            Market Research
          </div>
        </MatterBody>
        <MatterBody matterBodyOptions={{
        friction: 0.3,
        restitution: 0.4,
        density: 0.002
      }} x="65%" y="10%">
          <div className="text-sm sm:text-base md:text-lg bg-muted text-muted-foreground rounded-full hover:cursor-grab px-4 py-2 font-medium shadow-sm">
            Risk Assessment
          </div>
        </MatterBody>
        <MatterBody matterBodyOptions={{
        friction: 0.3,
        restitution: 0.4,
        density: 0.002
      }} x="50%" y="5%">
          <div className="text-sm sm:text-base md:text-lg bg-card text-card-foreground border rounded-full hover:cursor-grab px-4 py-2 font-medium shadow-sm">
            Sentiment Analysis
          </div>
        </MatterBody>
        <MatterBody matterBodyOptions={{
        friction: 0.3,
        restitution: 0.4,
        density: 0.002
      }} x="85%" y="15%" angle={10}>
          <div className="text-sm sm:text-base md:text-lg bg-destructive text-destructive-foreground rounded-full hover:cursor-grab px-4 py-2 font-medium shadow-sm">
            Buy/Sell/Hold
          </div>
        </MatterBody>
        <MatterBody matterBodyOptions={{
        friction: 0.3,
        restitution: 0.4,
        density: 0.002
      }} x="40%" y="15%" angle={5}>
          <div className="text-sm sm:text-base md:text-lg bg-primary/80 text-primary-foreground rounded-full hover:cursor-grab px-4 py-2 font-medium shadow-sm">
            15-Min Reports
          </div>
        </MatterBody>
      </Gravity>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
        
        <ChevronDown className="w-6 h-6 text-muted-foreground" />
      </div>
    </div>;
};