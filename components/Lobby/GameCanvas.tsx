import React from 'react';

interface GameCanvasProps {
  ws: WebSocket | null;
  phase: string;
}

export default function GameCanvas({ ws, phase }: GameCanvasProps) {
  return (
    <div style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
      padding: '40px', 
      borderRadius: '24px', 
      border: '4px solid black',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      textAlign: 'center',
      minWidth: '600px',
      minHeight: '400px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Canvas Area</h1>
      <p style={{ fontSize: '2rem', color: '#674ea7' }}>Current Phase: {phase}</p>
      <div style={{ marginTop: '40px', border: '3px dashed #ccc', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '1.5rem', color: '#666' }}>Drawing canvas will be rendered here...</p>
      </div>
    </div>
  );
}
