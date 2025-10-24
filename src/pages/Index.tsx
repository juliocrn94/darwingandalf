import { useState } from "react";
import { Header } from "@/components/Header";
import { ProgressSidebar } from "@/components/ProgressSidebar";
import { DiscoveryConversationStep } from "@/components/steps/DiscoveryConversationStep";
import { SelectAgentStep } from "@/components/steps/SelectAgentStep";
import { FlowTestStep } from "@/components/steps/FlowTestStep";
import { DarwinCreationStep } from "@/components/steps/DarwinCreationStep";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const steps = [
  { id: 1, title: "Discovery", description: "Conversación con AI" },
  { id: 2, title: "Template", description: "Seleccionar base" },
  { id: 3, title: "Flujo & Prueba", description: "Diagrama + Test" },
  { id: 4, title: "Darwin", description: "Crear agente" },
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [discoverySessionId, setDiscoverySessionId] = useState<string>("");
  const [discoveryData, setDiscoveryData] = useState<any>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string>("");

  const handleDiscoveryComplete = (data: any, sessionId: string) => {
    setDiscoveryData(data);
    setDiscoverySessionId(sessionId);
    setAgentName(data.agentName || "");
    setCurrentStep(1);
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId);
  };

  const handleFlowComplete = () => {
    setCurrentStep(3);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1 && isStepValid()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return discoveryData !== null && discoverySessionId !== "";
      case 1:
        return selectedAgentId !== null;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <DiscoveryConversationStep onDiscoveryComplete={handleDiscoveryComplete} />;
      case 1:
        return (
          <SelectAgentStep
            discoverySessionId={discoverySessionId}
            onAgentSelect={handleAgentSelect}
            selectedAgentId={selectedAgentId}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <FlowTestStep
            agentId={selectedAgentId!}
            onComplete={handleFlowComplete}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <DarwinCreationStep
            agentId={selectedAgentId!}
            agentName={agentName}
            discoveryData={discoveryData}
            onBack={handleBack}
          />
        );
      default:
        return <DiscoveryConversationStep onDiscoveryComplete={handleDiscoveryComplete} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-stretch">
            {/* Sidebar con progreso */}
            <ProgressSidebar steps={steps} currentStep={currentStep} />
            
            {/* Contenido principal */}
            <div className="flex-1 w-full">
              {renderStep()}
              
              {currentStep < steps.length - 1 && currentStep !== 0 && currentStep !== 2 && (
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
