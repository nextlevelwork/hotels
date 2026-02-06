import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export default function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                step.id < currentStep
                  ? 'bg-primary text-white'
                  : step.id === currentStep
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-gray-100 text-muted'
              )}
            >
              {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
            </div>
            <span
              className={cn(
                'text-sm font-medium hidden sm:block',
                step.id <= currentStep ? 'text-foreground' : 'text-muted'
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 mx-3',
                step.id < currentStep ? 'bg-primary' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
