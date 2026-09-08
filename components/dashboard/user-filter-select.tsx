'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/class-names';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUserById, getUsers } from '@/lib/api/users';
import type { User } from '@/lib/api/auth';

type UserFilterOption = Pick<User, '_id' | 'fullName' | 'email'>;

interface UserFilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  allLabel?: string;
  placeholder?: string;
  triggerClassName?: string;
  labelClassName?: string;
}

export function UserFilterSelect({
  value,
  onValueChange,
  allLabel = 'All Users',
  placeholder = 'All Users',
  triggerClassName,
  labelClassName,
}: UserFilterSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserFilterOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserFilterOption | null>(null);
  const [searchFailed, setSearchFailed] = useState(false);
  const skipUserFetchRef = useRef(false);

  useEffect(() => {
    if (value === 'all') {
      setSelectedUser(null);
      return;
    }

    if (skipUserFetchRef.current) {
      skipUserFetchRef.current = false;
      return;
    }

    let cancelled = false;
    getUserById(value)
      .then((user) => {
        if (!cancelled) {
          setSelectedUser({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setSelectedUser(null);
      });

    return () => {
      cancelled = true;
    };
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      setSearchFailed(false);
      try {
        const paginatedUsers = await getUsers({
          search: search.trim() || undefined,
          limit: 50,
        });
        setUsers(paginatedUsers.users);
      } catch {
        setUsers([]);
        setSearchFailed(true);
      } finally {
        setLoading(false);
      }
    }, search.trim() ? 300 : 0);

    return () => clearTimeout(timer);
  }, [open, search]);

  const displayLabel =
    value === 'all'
      ? placeholder
      : selectedUser?.fullName || selectedUser?.email || 'Selected user';

  const handleSelect = (userId: string, user?: UserFilterOption) => {
    if (userId === 'all') {
      setSelectedUser(null);
    } else if (user) {
      setSelectedUser(user);
      skipUserFetchRef.current = true;
    }
    onValueChange(userId);
    setOpen(false);
    setSearch('');
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-xl border border-border/50 bg-background/50 px-3 text-sm backdrop-blur-sm transition-all hover:border-primary/30',
            triggerClassName,
          )}
        >
          <span className={cn('truncate', labelClassName)}>{displayLabel}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[240px] p-2"
        align="start"
      >
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="mb-2 h-9"
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleSelect('all');
          }}
        >
          {allLabel}
        </DropdownMenuItem>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : searchFailed ? (
          <p className="px-2 py-3 text-center text-xs text-muted-foreground">
            Could not load users
          </p>
        ) : users.length === 0 ? (
          <p className="px-2 py-3 text-center text-xs text-muted-foreground">
            No users found
          </p>
        ) : (
          users.map((user) => (
            <DropdownMenuItem
              key={user._id}
              onSelect={(e) => {
                e.preventDefault();
                handleSelect(user._id, user);
              }}
            >
              <span className="truncate">{user.fullName || user.email}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
