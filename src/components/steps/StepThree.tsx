import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

export const StepThree = ({ onNext }: { onNext: () => void }) => {
  const [url, setUrl] = useState("");
  const [isAdapting, setIsAdapting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAdapt = () => {
    setIsAdapting(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAdapting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Adapt Agent to New Client</h2>
        <p className="text-muted-foreground">
          We'll scrape the client's website to customize the agent
        </p>
      </div>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Client Website URL</h3>
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="https://client-website.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
          />
          <Button variant="gradient" onClick={handleAdapt} disabled={!url || isAdapting}>
            {isAdapting ? "Adapting..." : "Start Adaptation"}
          </Button>
        </div>
        {isAdapting && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Analyzing website and adapting agent...
            </p>
          </div>
        )}
      </Card>

      {progress === 100 && (
        <>
          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-start gap-4 mb-4">
              <CheckCircle2 className="w-6 h-6 text-success mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Adaptation Complete</h3>
                <p className="text-sm text-muted-foreground">
                  Successfully extracted and adapted agent based on client data
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <FileText className="w-5 h-5 text-primary mb-2" />
                <p className="text-sm font-medium text-foreground">Pages Scraped</p>
                <p className="text-2xl font-bold text-primary">12</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 text-accent mb-2" />
                <p className="text-sm font-medium text-foreground">Intents Updated</p>
                <p className="text-2xl font-bold text-accent">8</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <CheckCircle2 className="w-5 h-5 text-success mb-2" />
                <p className="text-sm font-medium text-foreground">FAQs Extracted</p>
                <p className="text-2xl font-bold text-success">24</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-3">Extracted Company Context</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              AgroFinance Corp is a leading agricultural financing company specializing in providing
              customized loan solutions for farmers and agribusinesses. With over 15 years of
              experience, they offer flexible payment terms, competitive rates, and expert guidance
              throughout the financing process. Their mission is to empower agricultural growth through
              accessible and sustainable financial solutions.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Agricultural Finance</Badge>
              <Badge variant="secondary">Loan Solutions</Badge>
              <Badge variant="secondary">Expert Guidance</Badge>
              <Badge variant="secondary">Flexible Terms</Badge>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button variant="gradient" size="lg" onClick={onNext}>
              Continue to Voice Prompts
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
