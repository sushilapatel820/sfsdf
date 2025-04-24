import { useState, useEffect } from 'react';
import { notesService, NoteWithTags } from '@/lib/services/notes';
import { Database } from '@/lib/supabase';
import { useAuth } from './use-auth';

type Note = Database['public']['Tables']['notes']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];
type InsertNote = Database['public']['Tables']['notes']['Insert'];
type UpdateNote = Database['public']['Tables']['notes']['Update'];

export function useNotes() {
  const [notes, setNotes] = useState<NoteWithTags[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch notes and tags on component mount
  useEffect(() => {
    if (user) {
      fetchNotes();
      fetchTags();
    }
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;
    try {
      const data = await notesService.getNotes(user.id);
      setNotes(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    if (!user) return;
    try {
      const data = await notesService.getTags(user.id);
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const createNote = async (note: Omit<InsertNote, 'user_id'>, tags?: string[]) => {
    if (!user) throw new Error('User not authenticated');
    const newNote = await notesService.createNote({
      ...note,
      user_id: user.id,
    }, tags);
    setNotes((prev) => [newNote, ...prev]);
    await fetchTags(); // Refresh tags in case new ones were created
    return newNote;
  };

  const updateNote = async (noteId: string, updates: UpdateNote, tags?: string[]) => {
    if (!user) throw new Error('User not authenticated');
    const updatedNote = await notesService.updateNote(noteId, {
      ...updates,
      user_id: user.id,
    }, tags);
    setNotes((prev) =>
      prev.map((note) => (note.id === noteId ? updatedNote : note))
    );
    await fetchTags(); // Refresh tags in case they were updated
    return updatedNote;
  };

  const deleteNote = async (noteId: string) => {
    await notesService.deleteNote(noteId);
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
    await fetchTags(); // Refresh tags in case some are no longer used
  };

  const toggleFavorite = async (noteId: string, isFavorite: boolean) => {
    const updatedNote = await notesService.toggleFavorite(noteId, isFavorite);
    setNotes((prev) =>
      prev.map((note) => (note.id === noteId ? updatedNote : note))
    );
    return updatedNote;
  };

  return {
    notes,
    tags,
    loading,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    refreshNotes: fetchNotes,
    refreshTags: fetchTags,
  };
} 