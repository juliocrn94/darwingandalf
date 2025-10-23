import { Upload, FileJson } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export const StepOne = ({ onNext }: { onNext: () => void }) => {
  const [handoff, setHandoff] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Find Similar Handoffs</h2>
        <p className="text-muted-foreground">
          Upload or paste your client handoff to find similar agents in the database
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-card border-border hover:shadow-card transition-smooth">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-1">Upload JSON File</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop your handoff file here
              </p>
            </div>
            <Button variant="outline">Browse Files</Button>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <FileJson className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Paste Handoff JSON</h3>
          </div>
          <Textarea
            placeholder='{"metadata": {...}, "goals": [...], "pain_points": [...]}'
            className="min-h-[200px] font-mono text-sm"
            value={handoff}
            onChange={(e) => setHandoff(e.target.value)}
          />
          <Button 
            variant="gradient" 
            className="w-full mt-4"
            onClick={onNext}
            disabled={!handoff}
          >
            Search Similar Handoffs
          </Button>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-card border-border">
        <h3 className="font-semibold text-foreground mb-3">Example Handoff Structure</h3>
        <pre className="text-xs text-muted-foreground overflow-x-auto">
{`{
  "client": "AgroFinance Corp",
  "industry": "Agriculture, Finance",
  "objective": "Lead generation through consultative chat",
  "tone": "Professional, empathetic",
  "channels": ["web_chat", "whatsapp"],
  "goals": ["Capture lead info", "Schedule consultations"],
  "pain_points": ["Complex product info", "Long sales cycles"]
}`}
        </pre>
      </Card>
    </div>
  );
};
