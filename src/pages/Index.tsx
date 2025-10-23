import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Stepper } from "@/components/Stepper";
import { StepOne } from "@/components/steps/StepOne";
import { StepTwo } from "@/components/steps/StepTwo";
import { StepThree } from "@/components/steps/StepThree";
import { StepFour } from "@/components/steps/StepFour";
import { StepFive } from "@/components/steps/StepFive";
import heroImage from "@/assets/hero-ai.jpg";

const steps = [
  { id: 1, title: "Find Handoffs", description: "Search similar agents" },
  { id: 2, title: "Select Agent", description: "Choose base to clone" },
  { id: 3, title: "Adapt Agent", description: "Customize for client" },
  { id: 4, title: "Voice Prompt", description: "Optimize with audio" },
  { id: 5, title: "Final Review", description: "Test & deploy" },
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepOne onNext={handleNext} />;
      case 1:
        return <StepTwo onNext={handleNext} />;
      case 2:
        return <StepThree onNext={handleNext} />;
      case 3:
        return <StepFour onNext={handleNext} />;
      case 4:
        return <StepFive />;
      default:
        return <StepOne onNext={handleNext} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentStep={currentStep} />
      
      <main className="flex-1 overflow-auto">
        {currentStep === 0 && (
          <div className="relative h-64 overflow-hidden">
            <img
              src={heroImage}
              alt="AI Agent Cloning Platform"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          </div>
        )}
        
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Stepper steps={steps} currentStep={currentStep} />
          <div className="mt-8">{renderStep()}</div>
        </div>
      </main>
    </div>
  );
};

export default Index;
