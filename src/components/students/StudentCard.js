"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateStudent } from "@/lib/studentUtils";

export default function StudentCard({ student, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(
    student.userName || student.email || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset to original value
    setUserName(student.userName || student.email || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!userName.trim()) {
      toast.error("Student name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      await updateStudent(student.id, { userName });
      toast.success("Student name updated");

      // Update local state in parent component
      if (onUpdate) {
        onUpdate(student.id, { userName });
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student name");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 p-4 flex flex-row justify-between items-center">
        <div className="font-medium">Student Profile</div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={handleEdit}>
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Email
            </label>
            <div className="text-gray-900 font-medium">{student.email}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Name
            </label>
            {isEditing ? (
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isLoading}
                placeholder="Enter student name"
                className="max-w-xs"
              />
            ) : (
              <div className="text-gray-900 font-medium">
                {student.userName || student.email || "No name set"}
              </div>
            )}
          </div>

          {student.xp !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                Experience Points
              </label>
              <div className="text-gray-900 font-medium">{student.xp}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
