import html2canvas from "html2canvas";
import React, { useRef } from "react";

// This component wraps children and provides a ref for html2canvas
// 1080x1920 for mobile story format (Instagram, Snapchat, etc.)
// Story wrapper with vibrant background for story download
export const StoryCaptureWrapper = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#1f1f2cff',
        borderRadius: 48,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 8px 64px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      {children}
    </div>
  )
);
