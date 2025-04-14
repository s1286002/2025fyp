"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createStudent } from "@/lib/studentUtils";

// Form validation schema
const studentSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  userName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" }),
});

export default function AddStudentForm({ onStudentAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      email: "",
      userName: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const studentId = await createStudent(data);
      toast.success("Student added successfully");

      // Reset form and close it
      reset();
      setIsOpen(false);

      // Notify parent component to refresh the list
      if (onStudentAdded) {
        onStudentAdded({
          id: studentId,
          ...data,
          role: "student",
          xp: 0,
        });
      }
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      {!isOpen ? (
        <Button onClick={() => setIsOpen(true)}>Add Student</Button>
      ) : (
        <div className="bg-white p-4 rounded-md border">
          <h3 className="text-lg font-medium mb-4">Add New Student</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName">Name</Label>
              <Input
                id="userName"
                type="text"
                placeholder="Student Name"
                {...register("userName")}
                disabled={isLoading}
              />
              {errors.userName && (
                <p className="text-sm text-red-500">
                  {errors.userName.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setIsOpen(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Student"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
