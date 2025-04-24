'use client';

import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';

interface NoteEmptyStateProps {
  onCreate: () => void;
  message?: string;
}

export function NoteEmptyState({ 
  onCreate, 
  message = "You don't have any notes yet" 
}: NoteEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full flex flex-col items-center justify-center p-8"
    >
      <div className="flex flex-col items-center justify-center max-w-md text-center space-y-4">
        <div className="bg-muted rounded-full p-4">
          <PlusCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium">{message}</h3>
        <p className="text-muted-foreground">
          Create your first note to get started. You can organize and access your notes from anywhere.
        </p>
        <Button onClick={onCreate} className="mt-4">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Note
        </Button>
      </div>
    </motion.div>
  );
}