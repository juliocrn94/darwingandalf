import { useState } from "react";
import { Header } from "@/components/Header";
import { Stepper } from "@/components/Stepper";
import { StepOne } from "@/components/steps/StepOne";
import { StepTwo } from "@/components/steps/StepTwo";
import { StepThree } from "@/components/steps/StepThree";
import { StepFour } from "@/components/steps/StepFour";
import { StepFive } from "@/components/steps/StepFive";
import { StepSix } from "@/components/steps/StepSix";
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
        return <StepOne onDataChange={setHandoffData} />;
      case 1:
        return (
          <StepTwo
            onAgentSelect={setSelectedAgentId}
            selectedAgentId={selectedAgentId}
          />
        );
      case 2:
        return <StepThree />;
      case 3:
        return (
          <StepFour
            clientUrl={clientUrl}
            onUrlChange={setClientUrl}
          />
        );
      case 4:
        return (
          <StepFive
            selectedModel={selectedAIModel}
            onModelChange={setSelectedAIModel}
            onVariantSelect={setSelectedPromptVariant}
          />
        );
      case 5:
        return <StepSix />;
      default:
        return <StepOne onDataChange={setHandoffData} />;
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
