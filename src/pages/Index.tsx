import { useState } from "react";
import { Header } from "@/components/Header";
import { Stepper } from "@/components/Stepper";
import { FindHandoffsStep } from "@/components/steps/FindHandoffsStep";
import { SelectAgentStep } from "@/components/steps/SelectAgentStep";
import { ViewFlowStep } from "@/components/steps/ViewFlowStep";
import { StepFour } from "@/components/steps/StepFour";
import { VoicePromptStep } from "@/components/steps/VoicePromptStep";
import { FinalReviewStep } from "@/components/steps/FinalReviewStep";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HandoffData {
  type: "audio_recording" | "audio_file" | "text" | "json";
  content: Blob | string;
  metadata?: {
    duration?: number;
    fileName?: string;
    fileSize?: number;
  };
}

const steps = [
  { id: 1, title: "Find Handoffs", description: "Search similar agents" },
  { id: 2, title: "Select Agent", description: "Choose base to clone" },
  { id: 3, title: "View Flow", description: "Review & edit flow" },
  { id: 4, title: "Adapt Agent", description: "Customize for client" },
  { id: 5, title: "Voice Prompt", description: "Optimize with audio" },
  { id: 6, title: "Final Review", description: "Test & deploy" },
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [handoffData, setHandoffData] = useState<HandoffData | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [clientUrl, setClientUrl] = useState<string | null>(null);
  const [selectedAIModel, setSelectedAIModel] = useState<string>("gpt-4");
  const [selectedPromptVariant, setSelectedPromptVariant] = useState<number | null>(null);

  const handleNext = () => {
    if (currentStep < steps.length - 1 && isStepValid()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return handoffData !== null;
      case 1:
        return selectedAgentId !== null;
      case 2:
        return true; // Flow editor - always valid
      case 3:
        return clientUrl !== null && clientUrl.length > 0;
      case 4:
        return selectedPromptVariant !== null;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <FindHandoffsStep onDataChange={setHandoffData} />;
      case 1:
        return (
          <SelectAgentStep
            onAgentSelect={setSelectedAgentId}
            selectedAgentId={selectedAgentId}
            handoffId={handoffData?.metadata?.handoffId}
          />
        );
      case 2:
        return <ViewFlowStep />;
      case 3:
        return (
          <StepFour
            clientUrl={clientUrl}
            onUrlChange={setClientUrl}
          />
        );
      case 4:
        return (
          <VoicePromptStep
            selectedModel={selectedAIModel}
            onModelChange={setSelectedAIModel}
            onVariantSelect={setSelectedPromptVariant}
          />
        );
      case 5:
        return (
          <FinalReviewStep
            baseAgentId={selectedAgentId || undefined}
            selectedPromptVariant={selectedPromptVariant || undefined}
            clientUrl={clientUrl || undefined}
          />
        );
      default:
        return <FindHandoffsStep onDataChange={setHandoffData} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Stepper steps={steps} currentStep={currentStep} />
          <div className="mt-8">{renderStep()}</div>

          {currentStep < steps.length - 1 && (
            <div className="flex justify-end mt-8">
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                size="lg"
                className="gap-2"
              >
                Siguiente <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
