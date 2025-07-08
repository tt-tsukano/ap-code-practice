import type { NextApiRequest, NextApiResponse } from 'next';
import { ErrorReport } from '@/lib/error-monitoring';

// Simple error logging endpoint
// In production, you would integrate with services like Sentry, LogRocket, etc.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const errorReport: ErrorReport = req.body;
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Client Error Report:', {
        message: errorReport.message,
        severity: errorReport.severity,
        url: errorReport.url,
        timestamp: new Date(errorReport.timestamp).toISOString(),
        context: errorReport.context,
      });
    }

    // In production, you would:
    // 1. Validate the error report
    // 2. Send to your error tracking service (Sentry, Bugsnag, etc.)
    // 3. Store in database if needed
    // 4. Send alerts for critical errors

    // For now, we'll just acknowledge receipt
    res.status(200).json({ 
      message: 'Error report received',
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

  } catch (error) {
    console.error('Failed to process error report:', error);
    res.status(500).json({ message: 'Failed to process error report' });
  }
}