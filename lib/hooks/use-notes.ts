'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/providers/auth-provider';
import { Database } from '@/lib/supabase';

export type Note = Database['public']['Tables']['notes']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type NoteWithTags = Note & { tags: Tag[] };

export function useNotes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  // Fetch all notes with their tags for current user
  const notesQuery = useQuery({
    queryKey: ['notes', userId],
    queryFn: async (): Promise<NoteWithTags[]> => {
      if (!userId) return [];

      // Get all notes
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (notesError) throw notesError;

      // Get all note-tag relationships
      const { data: noteTags, error: noteTagsError } = await supabase
        .from('note_tags')
        .select('note_id, tag_id');

      if (noteTagsError) throw noteTagsError;

      // Get all tags
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('*');

      if (tagsError) throw tagsError;

      // Combine notes with their tags
      return notes.map(note => {
        const noteTagIds = noteTags
          .filter(nt => nt.note_id === note.id)
          .map(nt => nt.tag_id);
        
        const noteTags = tags
          .filter(tag => noteTagIds.includes(tag.id));

        return { ...note, tags: noteTags };
      });
    },
    enabled: !!userId,
  });

  // Create a new note
  const createNote = useMutation({
    mutationFn: async ({ 
      title, 
      content, 
      tags = [],
      is_favorite = false
    }: { 
      title: string; 
      content: string; 
      tags?: string[];
      is_favorite?: boolean;
    }) => {
      if (!userId) throw new Error('User not authenticated');

      // Insert note
      const { data: note, error: noteError } = await supabase
        .from('notes')
        .insert({ title, content, user_id: userId, is_favorite })
        .select()
        .single();

      if (noteError) throw noteError;

      // Create tags and associate them with the note
      if (tags.length > 0) {
        // For each tag name, get or create the tag
        for (const tagName of tags) {
          // Check if tag already exists
          const { data: existingTags, error: tagQueryError } = await supabase
            .from('tags')
            .select('*')
            .eq('name', tagName)
            .eq('user_id', userId);

          if (tagQueryError) throw tagQueryError;

          let tagId;

          if (existingTags && existingTags.length > 0) {
            // Use existing tag
            tagId = existingTags[0].id;
          } else {
            // Create new tag
            const { data: newTag, error: createTagError } = await supabase
              .from('tags')
              .insert({ name: tagName, user_id: userId })
              .select()
              .single();

            if (createTagError) throw createTagError;
            tagId = newTag.id;
          }

          // Associate tag with note
          const { error: noteTagError } = await supabase
            .from('note_tags')
            .insert({
              note_id: note.id,
              tag_id: tagId,
              user_id: userId
            });

          if (noteTagError) throw noteTagError;
        }
      }

      return note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', userId] });
    },
  });

  // Update a note
  const updateNote = useMutation({
    mutationFn: async ({ 
      id, 
      title, 
      content, 
      is_favorite, 
      tags = [] 
    }: { 
      id: string; 
      title?: string; 
      content?: string; 
      is_favorite?: boolean;
      tags?: string[] 
    }) => {
      if (!userId) throw new Error('User not authenticated');

      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (is_favorite !== undefined) updates.is_favorite = is_favorite;

      // Update note
      const { data: note, error: noteError } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (noteError) throw noteError;

      // If tags are provided, update them
      if (tags !== undefined) {
        // First, remove all existing note-tag associations
        const { error: deleteError } = await supabase
          .from('note_tags')
          .delete()
          .eq('note_id', id);

        if (deleteError) throw deleteError;

        // Then add new tags
        for (const tagName of tags) {
          // Check if tag already exists
          const { data: existingTags, error: tagQueryError } = await supabase
            .from('tags')
            .select('*')
            .eq('name', tagName)
            .eq('user_id', userId);

          if (tagQueryError) throw tagQueryError;

          let tagId;

          if (existingTags && existingTags.length > 0) {
            // Use existing tag
            tagId = existingTags[0].id;
          } else {
            // Create new tag
            const { data: newTag, error: createTagError } = await supabase
              .from('tags')
              .insert({ name: tagName, user_id: userId })
              .select()
              .single();

            if (createTagError) throw createTagError;
            tagId = newTag.id;
          }

          // Associate tag with note
          const { error: noteTagError } = await supabase
            .from('note_tags')
            .insert({
              note_id: id,
              tag_id: tagId,
              user_id: userId
            });

          if (noteTagError) throw noteTagError;
        }
      }

      return note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', userId] });
    },
  });

  // Toggle favorite status
  const toggleFavorite = useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .update({ is_favorite, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', userId] });
    },
  });

  // Delete a note
  const deleteNote = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', userId] });
    },
  });

  // Get all tags
  const tagsQuery = useQuery({
    queryKey: ['tags', userId],
    queryFn: async (): Promise<Tag[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('tags')
        .select('*');

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return {
    notes: notesQuery.data || [],
    tags: tagsQuery.data || [],
    isLoading: notesQuery.isLoading,
    createNote,
    updateNote,
    toggleFavorite,
    deleteNote,
  };
}