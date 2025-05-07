import React from "react";
import { cn } from "../../lib/utils";

interface CardProps {
    children: React.ReactNode;
    className?: string;
  }

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="border border-gray-200 rounded-lg shadow-sm p-4 bg-white">
      {children}
    </div>
  );
};

const CardHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="mb-4 text-xl font-semibold">{title}</div>
);

const CardContent: React.FC<CardProps> = ({ children, className }) => {
    return <div className={cn("p-4", className)}>{children}</div>;
  };

export { Card, CardHeader, CardContent };
