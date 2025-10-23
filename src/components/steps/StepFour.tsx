import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { Input } from "@/components/ui/input";

interface StepFourProps {
  clientUrl: string | null;
  onUrlChange: (url: string) => void;
}

export const StepFour = ({ clientUrl, onUrlChange }: StepFourProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Adapt Agent to New Client</h2>
        <p className="text-muted-foreground">
          Enter the client's website URL to customize the agent
        </p>
      </div>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Client Website URL</h3>
        </div>
        <Input
          placeholder="https://client-website.com"
          value={clientUrl || ""}
          onChange={(e) => onUrlChange(e.target.value)}
          className="w-full"
        />
      </Card>
    </div>
  );
};
