'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { NoteWithTags, useNotes } from '@/lib/hooks/use-notes';
import { Header } from '@/components/layout/header';
import { NoteCard } from '@/components/notes/note-card';
import { NoteEditor } from '@/components/notes/note-editor';
import { NoteEmptyState } from '@/components/notes/note-empty-state';
import { NoteFilter } from '@/components/notes/note-filter';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function FavoritesPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteWithTags | undefined>();
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { notes, tags, isLoading, createNote, updateNote, toggleFavorite, deleteNote } = useNotes();

  // Handle scroll event for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter notes to only favorites, then apply search and tag filters
  const filteredNotes = notes
    .filter(note => note.is_favorite)
    .filter((note) => {
      const matchesSearch = searchQuery
        ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesTags = selectedTags.length
        ? selectedTags.every((tag) =>
            note.tags.some((noteTag) => noteTag.name === tag)
          )
        : true;

      return matchesSearch && matchesTags;
    });

  const handleNewNote = () => {
    setSelectedNote(undefined);
    setIsCreatingNote(true);
  };

  const handleCloseEditor = () => {
    setSelectedNote(undefined);
    setIsCreatingNote(false);
  };

  const handleSaveNote = async (note: {
    id?: string;
    title: string;
    content: string;
    tags: string[];
    is_favorite: boolean;
  }) => {
    try {
      if (note.id) {
        await updateNote.mutateAsync({
          id: note.id,
          title: note.title,
          content: note.content,
          is_favorite: note.is_favorite,
          tags: note.tags,
        });
      } else {
        await createNote.mutateAsync({
          title: note.title,
          content: note.content,
          tags: note.tags,
          is_favorite: true,
        });
      }
      handleCloseEditor();
      toast.success(note.id ? 'Note updated successfully' : 'Note created successfully');
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
      throw error;
    }
  };

  const handleDeleteNote = async () => {
    if (noteToDelete) {
      try {
        await deleteNote.mutateAsync({ id: noteToDelete });
        if (selectedNote?.id === noteToDelete) {
          setSelectedNote(undefined);
        }
        toast.success('Note deleted successfully');
      } catch (error) {
        console.error('Error deleting note:', error);
        toast.error('Failed to delete note');
      } finally {
        setNoteToDelete(null);
      }
    }
  };

  const handleToggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        isScrolled={isScrolled} 
        onSearch={setSearchQuery}
        onNewNote={handleNewNote} 
      />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 shrink-0">
            <NoteFilter
              tags={tags}
              selectedTags={selectedTags}
              onSelectTag={handleToggleTag}
              onClearFilters={handleClearFilters}
            />
          </aside>
          
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Favorite Notes</h1>
              <p className="text-muted-foreground">
                Quick access to your most important notes
              </p>
            </div>
            
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="flex items-center justify-center h-[50vh]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : selectedNote || isCreatingNote ? (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <NoteEditor
                    note={selectedNote}
                    onClose={handleCloseEditor}
                    onSave={handleSaveNote}
                  />
                </motion.div>
              ) : filteredNotes.length > 0 ? (
                <motion.div 
                  key="notes"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onSelect={() => setSelectedNote(note)}
                        onDelete={(id) => setNoteToDelete(id)}
                        onToggleFavorite={(id, value) =>
                          toggleFavorite.mutate({ id, is_favorite: value })
                        }
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <NoteEmptyState onCreate={handleNewNote} message={
                    selectedTags.length > 0 || searchQuery
                      ? "No favorite notes match your filters"
                      : "You don't have any favorite notes yet"
                  } />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AlertDialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              note and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}