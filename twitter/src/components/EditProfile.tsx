"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
}

const EditProfile = ({ isOpen, onClose }: EditProfileProps) => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    bio: "",
    location: "",
    website: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);
      await updateProfile(formData);
      onClose();
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Failed to update profile. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-black border-gray-800 text-white max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </Button>
              <CardTitle className="text-xl font-bold">Edit Profile</CardTitle>
            </div>

            <Button
              type="submit"
              form="edit-profile-form"
              className="bg-white text-black rounded-full px-6"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form
            id="edit-profile-form"
            onSubmit={handleSubmit}
            className="space-y-6 mt-4"
          >
            {/* Name */}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
              <Label>Avatar URL</Label>
              <Input
                value={formData.avatar}
                onChange={(e) => handleChange("avatar", e.target.value)}
                disabled={isLoading}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;
