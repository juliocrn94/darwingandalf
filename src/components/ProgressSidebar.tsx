import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface ProgressSidebarProps {
  steps: Step[];
  currentStep: number;
}

export const ProgressSidebar = ({ steps, currentStep }: ProgressSidebarProps) => {
  return (
    <Card className="w-64 p-6 bg-card border-border sticky top-6 h-fit">
      <h3 className="text-lg font-bold text-foreground mb-6">Progreso</h3>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-smooth flex-shrink-0",
                  currentStep > index
                    ? "bg-primary border-primary text-primary-foreground"
                    : currentStep === index
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-background border-border text-muted-foreground"
                )}
              >
                {currentStep > index ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-base font-semibold">{step.id}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-12 mt-2 transition-smooth",
                    currentStep > index ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
            <div className="flex-1 pb-2">
              <p
                className={cn(
                  "font-semibold text-sm transition-smooth",
                  currentStep >= index ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
