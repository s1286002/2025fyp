import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { updateGameRecord, deleteGameRecord } from "@/lib/gameRecordUtils";
import { toast } from "sonner";

// Form validation schema
const gameRecordSchema = z.object({
  Level: z
    .string()
    .refine((val) => !isNaN(parseInt(val)), {
      message: "Level must be a number",
    })
    .transform((val) => parseInt(val)),
  Score: z
    .string()
    .refine((val) => !isNaN(parseInt(val)), {
      message: "Score must be a number",
    })
    .transform((val) => parseInt(val)),
  IsCompleted: z.boolean().default(false),
});

export default function GameRecordEditForm({
  record,
  isOpen,
  onClose,
  onRecordUpdated,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const form = useForm({
    resolver: zodResolver(gameRecordSchema),
    defaultValues: {
      Level: record?.Level?.toString() || "0",
      Score: record?.Score?.toString() || "0",
      IsCompleted: record?.IsCompleted || false,
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await updateGameRecord(record.id, data);
      if (result.success) {
        toast.success(result.message);
        onRecordUpdated();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error updating game record:", error);
      toast.error("Failed to update game record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteGameRecord(record.id);
      if (result.success) {
        toast.success(result.message);
        onRecordUpdated();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting game record:", error);
      toast.error("Failed to delete game record");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Game Record</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-sm font-medium">User:</div>
                <div>{record?.userName || "Unknown"}</div>
              </div>
              <div>
                <div className="text-sm font-medium">ID:</div>
                <div className="font-mono text-xs truncate">{record?.id}</div>
              </div>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="Level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="IsCompleted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Completed</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-between gap-4 pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting || isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Record"}
                </Button>
                <div className="flex gap-2 ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting || isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isDeleting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this game record. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Record"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
