'use client';

import { useState, useEffect } from 'react';
import { X, Save, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';
import { NoteWithTags } from '@/lib/services/notes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface NoteEditorProps {
  note?: NoteWithTags | null;
  onClose: () => void;
  onSave: (note: {
    id?: string;
    title: string;
    content: string;
    tags: string[];
    is_favorite: boolean;
  }) => Promise<void>;
}

export function NoteEditor({ note, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isFavorite, setIsFavorite] = useState(note?.is_favorite || false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(
    note?.tags ? note.tags.map((tag) => tag.name) : []
  );
  const [activeTab, setActiveTab] = useState('edit');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsFavorite(note.is_favorite);
      setTags(note.tags ? note.tags.map((tag) => tag.name) : []);
    }
  }, [note]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your note');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        id: note?.id,
        title,
        content,
        tags,
        is_favorite: isFavorite,
      });
      toast.success('Note saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full flex flex-col bg-background rounded-lg shadow-lg border"
    >
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex-1 mr-4">
          <Input
            type="text"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9 text-muted-foreground hover:text-yellow-500',
              isFavorite && 'text-yellow-500'
            )}
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Star
              className={cn('h-5 w-5', isFavorite && 'fill-yellow-500')}
            />
            <span className="sr-only">
              {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
            {!isSaving && <Save className="ml-2 h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b px-4">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="edit" className="flex-1 p-4 overflow-auto">
            <Textarea
              placeholder="Write your note content here... Markdown is supported!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[300px] resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
          </TabsContent>
          <TabsContent value="preview" className="flex-1 p-6 overflow-auto">
            {content ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                No content to preview
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4 border-t">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag}</span>
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex">
          <Input
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddTag}
            className="ml-2"
          >
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
}