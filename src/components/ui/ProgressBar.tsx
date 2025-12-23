'use client'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  completedSteps?: number[]
}

export default function ProgressBar({ currentStep, totalSteps, completedSteps = [] }: ProgressBarProps) {
  const progress = (completedSteps.length / totalSteps) * 100
  
  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Progreso del formulario</span>
        <span className="text-sm text-gray-500">{completedSteps.length} de {totalSteps} secciones</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1
          const isCompleted = completedSteps.includes(stepNumber)
          const isCurrent = stepNumber === currentStep
          
          return (
            <div 
              key={stepNumber} 
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                isCompleted ? 'bg-green-500 text-white' :
                isCurrent ? 'bg-blue-500 text-white' :
                'bg-gray-300 text-gray-600'
              }`}
            >
              {isCompleted ? '✓' : stepNumber}
            </div>
          )
        })}
      </div>
    </div>
  )
}