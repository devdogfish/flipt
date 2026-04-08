"use client";

import Link from "next/link";
import { Plus, PenLine, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NewDeckButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 shrink-0 h-9">
          <Plus className="w-4 h-4" />
          New deck
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link
            href="/decks/new"
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <PenLine className="w-4 h-4 text-muted-foreground" />
            Create from scratch
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/decks/import"
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-muted-foreground" />
            Upload file
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
