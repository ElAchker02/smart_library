import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingNavButtonProps {
  to: string;
  icon: LucideIcon;
  label: string;
  className?: string;
}

const FloatingNavButton: React.FC<FloatingNavButtonProps> = ({ 
  to, 
  icon: Icon, 
  label,
  className 
}) => {
  return (
    <Link to={to}>
      <Button
        size="lg"
        className={cn(
          "fixed bottom-6 right-6 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50",
          className
        )}
      >
        <Icon className="w-5 h-5 mr-2" />
        {label}
      </Button>
    </Link>
  );
};

export default FloatingNavButton;
