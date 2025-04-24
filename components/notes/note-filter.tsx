'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Database } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

type Tag = Database['public']['Tables']['tags']['Row'];

interface NoteFilterProps {
  tags: Tag[];
  selectedTags: string[];
  onSelectTag: (tag: string) => void;
  onClearFilters: () => void;
}

export function NoteFilter({
  tags,
  selectedTags,
  onSelectTag,
  onClearFilters,
}: NoteFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Filters</div>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={onClearFilters}
          >
            Clear all
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {selectedTags.length > 0 ? (
          selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
              <button
                onClick={() => onSelectTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag}</span>
              </button>
            </Badge>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No active filters</div>
        )}
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-full justify-start">
            <Filter className="mr-2 h-4 w-4" />
            {selectedTags.length > 0 ? 'Add more tags' : 'Add tag filter'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" sideOffset={8}>
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => {
                      onSelectTag(tag.name);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-2 text-sm',
                      selectedTags.includes(tag.name) && 'bg-accent'
                    )}
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}