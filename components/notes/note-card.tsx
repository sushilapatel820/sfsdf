'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Star, Trash2, MoreVertical, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';
import { NoteWithTags } from '@/lib/hooks/use-notes';
import { summarizeNote } from '@/lib/services/openai';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NoteCardProps {
  note: NoteWithTags;
  onSelect: (note: NoteWithTags) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, value: boolean) => void;
  onDirectEdit?: (note: NoteWithTags) => void;
}

export function NoteCard({
  note,
  onSelect,
  onDelete,
  onToggleFavorite,
  onDirectEdit,
}: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(note.id, !note.is_favorite);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(note.id);
  };

  const handleSummarize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSummaryOpen(true);
    setIsLoading(true);
    
    try {
      const result = await summarizeNote(note.content);
      setSummary(result.summary);
    } catch (error) {
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare a preview of the content (first 100 characters)
  const contentPreview = note.content
    ? note.content.length > 100
      ? `${note.content.substring(0, 100)}...`
      : note.content
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card
            className={cn(
              'cursor-pointer overflow-hidden transition-all duration-200',
              isHovered && 'shadow-md'
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onSelect(note)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="line-clamp-1 text-lg">
                  {note.title || 'Untitled Note'}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8 text-muted-foreground hover:text-yellow-500',
                      note.is_favorite && 'text-yellow-500'
                    )}
                    onClick={handleToggleFavorite}
                  >
                    <Star
                      className={cn(
                        'h-4 w-4',
                        note.is_favorite && 'fill-yellow-500'
                      )}
                    />
                    <span className="sr-only">
                      {note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    </span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onDirectEdit ? onDirectEdit(note) : onSelect(note);
                      }}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSummarize}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Summarize
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardDescription className="text-xs">
                {format(new Date(note.updated_at), 'MMM d, yyyy · h:mm a')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="prose prose-sm dark:prose-invert prose-p:my-0 prose-headings:my-0 prose-ul:my-0 prose-ol:my-0 max-w-none overflow-hidden">
                <div className="line-clamp-3">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {contentPreview || 'No content'}
                  </ReactMarkdown>
                </div>
              </div>
            </CardContent>
            {note.tags && note.tags.length > 0 && (
              <CardFooter className="flex flex-wrap gap-1 p-4 pt-0">
                {note.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </CardFooter>
            )}
          </Card>
        </HoverCardTrigger>
        <HoverCardContent 
          align="start" 
          className="w-[350px] p-4"
          sideOffset={12}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">
                {note.title || 'Untitled Note'}
              </h4>
              <time className="text-xs text-muted-foreground">
                {format(new Date(note.updated_at), 'MMM d, yyyy')}
              </time>
            </div>
            <div className="text-sm text-muted-foreground line-clamp-4">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Override heading components to be more compact
                  h1: ({children}) => <span className="font-bold">{children}</span>,
                  h2: ({children}) => <span className="font-bold">{children}</span>,
                  h3: ({children}) => <span className="font-bold">{children}</span>,
                  // Remove margins from paragraphs
                  p: ({children}) => <p className="my-1">{children}</p>,
                  // Make lists more compact
                  ul: ({children}) => <ul className="my-1 ml-4">{children}</ul>,
                  ol: ({children}) => <ol className="my-1 ml-4">{children}</ol>,
                  // Hide images in preview
                  img: () => null,
                  // Simplify code blocks
                  code: ({children}) => <code className="text-xs">{children}</code>,
                  pre: ({children}) => <pre className="text-xs bg-muted p-1 rounded">{children}</pre>,
                }}
              >
                {note.content || 'No content'}
              </ReactMarkdown>
            </div>
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {note.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
                {note.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{note.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
      <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Summary</DialogTitle>
            <DialogDescription>
              {isLoading ? 'Generating summary...' : 'Here\'s what AI thinks about this note'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{summary}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}