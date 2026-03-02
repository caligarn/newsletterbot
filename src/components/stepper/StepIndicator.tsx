'use client'

interface StepIndicatorProps {
  currentStep: number
  steps: { label: string; description: string }[]
}

export default function StepIndicator({
  currentStep,
  steps,
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Step list */}
      <div className="flex flex-col gap-0">
        {steps.map((step, i) => {
          const stepNum = i + 1
          const isActive = stepNum === currentStep
          const isCompleted = stepNum < currentStep
          const isFuture = stepNum > currentStep

          return (
            <div key={i} className="flex items-stretch gap-4">
              {/* Vertical line + circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full
                    text-sm font-semibold transition-all duration-300
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isActive ? 'bg-brand-600 text-white ring-4 ring-brand-100' : ''}
                    ${isFuture ? 'bg-gray-200 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                {/* Connecting line */}
                {i < steps.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 min-h-[24px] transition-colors duration-300 ${
                      isCompleted ? 'bg-green-300' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              {/* Label + description */}
              <div className={`pb-6 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
                <p
                  className={`text-sm font-semibold leading-9 transition-colors duration-300 ${
                    isActive ? 'text-brand-700' : isCompleted ? 'text-green-700' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                {(isActive || isCompleted) && (
                  <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
