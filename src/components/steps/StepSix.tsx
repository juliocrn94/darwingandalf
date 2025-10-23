import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, CheckCircle, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockAgent = {
  agent_id: "AG-AGRO-NEW-001",
  name: "AgroFinance Consultation Bot",
  status: "ready_to_test",
  cloned_from: "AG-AGRO-001",
  created_at: new Date().toISOString(),
  mission: "You are a professional and empathetic AI assistant representing AgroFinance Corp...",
  context: "AgroFinance Corp is a leading agricultural financing company...",
  intents: [
    { name: "greeting", examples: ["hello", "hi", "good morning"], slots: [] },
    { name: "loan_inquiry", examples: ["tell me about loans", "what loans do you offer"], slots: ["loan_type"] },
    { name: "schedule_consultation", examples: ["book a call", "schedule meeting"], slots: ["date", "time"] },
  ],
  summary: "Agent cloned from AG-AGRO-001, adapted to AgroFinance Corp, enhanced with voice prompts",
};

export const StepSix = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Agent Successfully Generated</h2>
          <p className="text-muted-foreground">
            Your new agent is ready for testing and deployment
          </p>
        </div>
        <Badge className="bg-success/20 text-success border-success/50">
          <CheckCircle className="w-4 h-4 mr-1" />
          Ready to Test
        </Badge>
      </div>

      <Card className="p-6 bg-gradient-primary border-primary/50">
        <div className="flex items-start justify-between text-primary-foreground">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6" />
              <h3 className="text-xl font-bold">{mockAgent.name}</h3>
            </div>
            <p className="text-primary-foreground/80 text-sm mb-4">{mockAgent.summary}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                ID: {mockAgent.agent_id}
              </Badge>
              <Badge variant="outline" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                Cloned from: {mockAgent.cloned_from}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Intents</p>
            <p className="text-3xl font-bold text-primary">{mockAgent.intents.length}</p>
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Examples</p>
            <p className="text-3xl font-bold text-accent">
              {mockAgent.intents.reduce((acc, intent) => acc + intent.examples.length, 0)}
            </p>
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Slots</p>
            <p className="text-3xl font-bold text-success">
              {mockAgent.intents.reduce((acc, intent) => acc + intent.slots.length, 0)}
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-card border-border">
        <h3 className="font-semibold text-foreground mb-4">Agent Configuration</h3>
        <Tabs defaultValue="mission" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mission">Mission</TabsTrigger>
            <TabsTrigger value="context">Context</TabsTrigger>
            <TabsTrigger value="intents">Intents</TabsTrigger>
          </TabsList>
          <TabsContent value="mission" className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-lg">
              <p className="text-sm text-muted-foreground leading-relaxed">{mockAgent.mission}</p>
            </div>
          </TabsContent>
          <TabsContent value="context" className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-lg">
              <p className="text-sm text-muted-foreground leading-relaxed">{mockAgent.context}</p>
            </div>
          </TabsContent>
          <TabsContent value="intents" className="space-y-4">
            {mockAgent.intents.map((intent) => (
              <div key={intent.name} className="p-4 bg-secondary/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">{intent.name}</h4>
                <div className="flex flex-wrap gap-2">
                  {intent.examples.map((example, i) => (
                    <Badge key={i} variant="secondary">
                      "{example}"
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </Card>

      <div className="flex gap-3">
        <Button variant="gradient" className="flex-1">
          <ExternalLink className="w-4 h-4 mr-2" />
          Test Agent
        </Button>
        <Button variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Export JSON
        </Button>
        <Button variant="outline">Deploy to Production</Button>
      </div>
    </div>
  );
};
