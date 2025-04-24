'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Menu, Pencil, Search, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/providers/auth-provider';
import { summarizeDashboard } from '@/lib/services/openai';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

type HeaderProps = {
  isScrolled?: boolean;
  onSearch?: (query: string) => void;
  onNewNote?: () => void;
  notes?: Array<{ title: string; content: string }>;
};

export function Header({ isScrolled, onSearch, onNewNote, notes = [] }: HeaderProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleSummarizeDashboard = async () => {
    if (notes.length === 0) {
      setSummary('No notes available to summarize.');
      setIsSummaryOpen(true);
      return;
    }

    setIsSummaryOpen(true);
    setIsLoading(true);
    
    try {
      const result = await summarizeDashboard(notes);
      setSummary(result.summary);
    } catch (error) {
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : '?';

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-200',
          isScrolled
            ? 'bg-background/80 backdrop-blur-sm border-b'
            : 'bg-transparent'
        )}
      >
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link 
                    href="/dashboard" 
                    className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent flex items-center"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    All Notes
                  </Link>
                  <Link 
                    href="/dashboard/favorites" 
                    className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent flex items-center"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Favorites
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">NoteCraft</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                All Notes
              </Link>
              <Link
                href="/dashboard/favorites"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Favorites
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                {onSearch && (
                  <div className="hidden md:flex relative w-60">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search notes..."
                      className="pl-9 w-full bg-accent/50 border-accent"
                      onChange={(e) => onSearch(e.target.value)}
                    />
                  </div>
                )}
                
                {notes.length > 0 && (
                  <Button
                    onClick={handleSummarizeDashboard}
                    size="sm"
                    variant="outline"
                    className="hidden md:flex"
                  >
                    <Sparkles className="mr-2 h-4 w-4" /> AI Summary
                  </Button>
                )}
                
                {onNewNote && (
                  <Button
                    onClick={onNewNote}
                    size="sm"
                    className="hidden md:flex"
                  >
                    <Plus className="mr-2 h-4 w-4" /> New Note
                  </Button>
                )}
                
                <ThemeToggle />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={userInitials} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Account</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            
            {!user && (
              <>
                <ThemeToggle />
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => router.push('/login')}
                >
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.header>
      <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dashboard AI Summary</DialogTitle>
            <DialogDescription>
              {isLoading ? 'Analyzing your notes...' : 'Here\'s an overview of your notes'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}