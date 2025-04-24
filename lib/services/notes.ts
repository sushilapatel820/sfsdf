import { supabase } from '../supabase';
import { Database } from '../supabase';
import { toast } from 'sonner';

type Note = Database['public']['Tables']['notes']['Row'];
type InsertNote = Database['public']['Tables']['notes']['Insert'];
type UpdateNote = Database['public']['Tables']['notes']['Update'];
type Tag = Database['public']['Tables']['tags']['Row'];
type InsertTag = Database['public']['Tables']['tags']['Insert'];

export type NoteWithTags = Note & {
  tags: Tag[];
};

export const notesService = {
  // Create a new note
  async createNote(note: InsertNote, tags: string[] = []) {
    try {
      // First create the note
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .insert(note)
        .select()
        .single();

      if (noteError) throw noteError;

      // Then create tags and note_tags relationships
      if (tags.length > 0) {
        // Create tags that don't exist
        const { data: existingTags, error: tagsError } = await supabase
          .from('tags')
          .select('id, name')
          .eq('user_id', note.user_id)
          .in('name', tags);

        if (tagsError) throw tagsError;

        const existingTagNames = existingTags.map(t => t.name);
        const newTags = tags.filter(tag => !existingTagNames.includes(tag));

        if (newTags.length > 0) {
          const { error: createTagsError } = await supabase
            .from('tags')
            .insert(newTags.map(name => ({
              name,
              user_id: note.user_id
            })));

          if (createTagsError) throw createTagsError;
        }

        // Get all tags again to get their IDs
        const { data: allTags, error: allTagsError } = await supabase
          .from('tags')
          .select('id, name')
          .eq('user_id', note.user_id)
          .in('name', tags);

        if (allTagsError) throw allTagsError;

        // Create note_tags relationships
        const { error: noteTagsError } = await supabase
          .from('note_tags')
          .insert(allTags.map(tag => ({
            note_id: noteData.id,
            tag_id: tag.id,
            user_id: note.user_id
          })));

        if (noteTagsError) throw noteTagsError;
      }

      toast.success('Note created successfully');
      return this.getNoteById(noteData.id);
    } catch (error) {
      toast.error('Failed to create note');
      throw error;
    }
  },

  // Get all notes for a user with their tags
  async getNotes(userId: string) {
    try {
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select(`
          *,
          tags:note_tags(
            tag:tags(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

      // Transform the data to match NoteWithTags type
      const transformedNotes: NoteWithTags[] = notes.map(note => ({
        ...note,
        tags: note.tags.map((t: any) => t.tag)
      }));

      return transformedNotes;
    } catch (error) {
      toast.error('Failed to fetch notes');
      throw error;
    }
  },

  // Get a single note by ID with its tags
  async getNoteById(noteId: string) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          tags:note_tags(
            tag:tags(*)
          )
        `)
        .eq('id', noteId)
        .single();

      if (error) throw error;

      // Transform the data to match NoteWithTags type
      const transformedNote: NoteWithTags = {
        ...data,
        tags: data.tags.map((t: any) => t.tag)
      };

      return transformedNote;
    } catch (error) {
      toast.error('Failed to fetch note');
      throw error;
    }
  },

  // Update a note and its tags
  async updateNote(noteId: string, updates: UpdateNote, tags?: string[]) {
    try {
      // First update the note
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', noteId)
        .select()
        .single();

      if (noteError) throw noteError;

      // If tags are provided, update them
      if (tags !== undefined) {
        // Delete existing note_tags
        const { error: deleteError } = await supabase
          .from('note_tags')
          .delete()
          .eq('note_id', noteId);

        if (deleteError) throw deleteError;

        if (tags.length > 0) {
          // Create tags that don't exist
          const { data: existingTags, error: tagsError } = await supabase
            .from('tags')
            .select('id, name')
            .eq('user_id', updates.user_id!)
            .in('name', tags);

          if (tagsError) throw tagsError;

          const existingTagNames = existingTags.map(t => t.name);
          const newTags = tags.filter(tag => !existingTagNames.includes(tag));

          if (newTags.length > 0) {
            const { error: createTagsError } = await supabase
              .from('tags')
              .insert(newTags.map(name => ({
                name,
                user_id: updates.user_id
              })));

            if (createTagsError) throw createTagsError;
          }

          // Get all tags again to get their IDs
          const { data: allTags, error: allTagsError } = await supabase
            .from('tags')
            .select('id, name')
            .eq('user_id', updates.user_id!)
            .in('name', tags);

          if (allTagsError) throw allTagsError;

          // Create new note_tags relationships
          const { error: noteTagsError } = await supabase
            .from('note_tags')
            .insert(allTags.map(tag => ({
              note_id: noteId,
              tag_id: tag.id,
              user_id: updates.user_id
            })));

          if (noteTagsError) throw noteTagsError;
        }
      }

      toast.success('Note updated successfully');
      return this.getNoteById(noteId);
    } catch (error) {
      toast.error('Failed to update note');
      throw error;
    }
  },

  // Get all tags for a user
  async getTags(userId: string) {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      toast.error('Failed to fetch tags');
      throw error;
    }
  },

  // Delete a note and its tag relationships
  async deleteNote(noteId: string) {
    try {
      // Delete note_tags first (RLS will handle this cascade)
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
      throw error;
    }
  },

  // Toggle favorite status
  async toggleFavorite(noteId: string, isFavorite: boolean) {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_favorite: isFavorite })
        .eq('id', noteId);

      if (error) throw error;
      toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites');
      return this.getNoteById(noteId);
    } catch (error) {
      toast.error('Failed to update favorite status');
      throw error;
    }
  }
}; 