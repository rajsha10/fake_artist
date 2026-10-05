import React, { ButtonHTMLAttributes } from 'react';
import styles from './ReusableButton.module.css';

interface ReusableButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function ReusableButton({ 
  children, 
  className = '', 
  ...props 
}: ReusableButtonProps) {
  return (
    <button 
      className={`${styles.sketchButton} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}
