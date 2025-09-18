'use client';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { data: session } = useSession();

  console.log(session);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserIcon />
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        {session?.user?.email ? (
          <DropdownMenuContent>
            <DropdownMenuLabel>{session?.user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        ) : (
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link href="/login">Sign in</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
