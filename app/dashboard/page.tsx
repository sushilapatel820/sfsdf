'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useNotes } from '@/hooks/use-notes';
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
import { NoteWithTags } from '@/lib/services/notes';

export default function DashboardPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteWithTags | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [noteToEdit, setNoteToEdit] = useState<NoteWithTags | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { notes, tags, loading, createNote, updateNote, deleteNote, toggleFavorite } = useNotes();

  // Handle scroll event for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter notes based on search query and selected tags
  const filteredNotes = notes.filter((note) => {
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
    setSelectedNote(null);
    setIsCreatingNote(true);
  };

  const handleCloseEditor = () => {
    setSelectedNote(null);
    setIsCreatingNote(false);
  };

  const handleSaveNote = async (note: {
    id?: string;
    title: string;
    content: string;
    is_favorite: boolean;
    tags: string[];
  }) => {
    try {
      if (note.id) {
        await updateNote(note.id, {
          title: note.title,
          content: note.content,
          is_favorite: note.is_favorite,
        }, note.tags);
      } else {
        await createNote({
          title: note.title,
          content: note.content,
          is_favorite: false,
        }, note.tags);
      }
      handleCloseEditor();
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  };

  const handleDeleteNote = async () => {
    if (noteToDelete) {
      try {
        await deleteNote(noteToDelete);
        if (selectedNote?.id === noteToDelete) {
          handleCloseEditor();
        }
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

  const handleNoteSelect = (note: NoteWithTags) => {
    setNoteToEdit(note);
  };

  const handleDirectEdit = (note: NoteWithTags) => {
    setSelectedNote(note);
  };

  const handleConfirmEdit = () => {
    setSelectedNote(noteToEdit);
    setNoteToEdit(null);
  };

  const handleCancelEdit = () => {
    setNoteToEdit(null);
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
            <AnimatePresence mode="wait">
              {loading ? (
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
                        onSelect={() => handleNoteSelect(note)}
                        onDelete={(id) => setNoteToDelete(id)}
                        onToggleFavorite={(id, value) =>
                          toggleFavorite(id, value)
                        }
                        onDirectEdit={handleDirectEdit}
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
                      ? "No notes match your filters"
                      : "You don't have any notes yet"
                  } />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AlertDialog open={!!noteToDelete} onOpenChange={() => setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!noteToEdit} onOpenChange={(open) => !open && setNoteToEdit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Note</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to edit this note? You can make changes to its title, content, and tags.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelEdit}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEdit}>Edit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}