import React from 'react';
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from './button';

export interface ErrorMessageProps {
  title: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorMessage({ title, message, onRetry, onBack }: ErrorMessageProps) {
  return (
    <div className="text-center">
      <div className="text-red-500 text-6xl mb-4">
        <AlertCircle className="h-16 w-16 mx-auto" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-center">
        {onRetry && (
          <Button 
            variant="default" 
            onClick={onRetry}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            再試行
          </Button>
        )}
        {onBack && (
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
        )}
      </div>
    </div>
  );
}