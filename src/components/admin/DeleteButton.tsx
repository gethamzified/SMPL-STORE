"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteButtonProps {
  id: string;
  onDelete: (id: string) => Promise<any>;
  itemName?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function DeleteButton({
  id,
  onDelete,
  itemName,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  className
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await onDelete(id);

      // Handle potential returned error object or assumed success if no error field
      if (res && typeof res === 'object' && 'error' in res && res.error) {
        toast.error("Error deleting item", {
          description: String(res.error)
        });
      } else {
        toast.success(itemName ? `${itemName} deleted` : "Item deleted", {
          description: "The item has been removed successfully."
        });
        setIsOpen(false);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Deletion failed", {
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className={`text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg ${className}`}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-neutral-900 border-white/10 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-white/50">
            {description} {itemName && <span className="text-white font-medium italic">({itemName})</span>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white border-0"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

