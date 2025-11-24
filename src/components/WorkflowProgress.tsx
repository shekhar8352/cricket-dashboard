import React from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowProgressProps {
    currentStep: 'series' | 'match' | 'performance';
    seriesCreated: boolean;
    matchesCreated: boolean;
    matchCount: number;
}

export default function WorkflowProgress({
    currentStep,
    seriesCreated,
    matchesCreated,
    matchCount
}: WorkflowProgressProps) {

    const steps = [
        { id: 'series', label: 'Create Series', completed: seriesCreated },
        { id: 'match', label: 'Add Matches', completed: matchesCreated, count: matchCount },
        { id: 'performance', label: 'Record Performance', completed: false } // Performance is ongoing
    ];

    return (
        <div className="w-full py-6 mb-8">
            <div className="flex items-center justify-between max-w-3xl mx-auto relative">
                {/* Progress Bar Background */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-muted -z-10" />

                {/* Progress Bar Fill */}
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary transition-all duration-500 -z-10"
                    style={{
                        width: currentStep === 'series' ? '0%' :
                            currentStep === 'match' ? '50%' : '100%'
                    }}
                />

                {steps.map((step, index) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = step.completed;
                    const isUpcoming = !isActive && !isCompleted;

                    return (
                        <div key={step.id} className="flex flex-col items-center bg-background px-2">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                    isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                        isActive ? "border-primary text-primary bg-background" :
                                            "border-muted text-muted-foreground bg-background"
                                )}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="w-6 h-6" />
                                ) : (
                                    <span className="font-bold">{index + 1}</span>
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <p className={cn(
                                    "text-sm font-medium",
                                    isActive ? "text-primary" :
                                        isCompleted ? "text-foreground" : "text-muted-foreground"
                                )}>
                                    {step.label}
                                </p>
                                {step.count !== undefined && step.count > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        {step.count} matches
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
