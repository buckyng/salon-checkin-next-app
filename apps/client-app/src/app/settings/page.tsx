'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@shared/contexts/UserContext';
import {
  fetchUserProfile,
  updateUserProfile,
} from '@shared/services/userService';
import { getFileURL } from '@shared/services/storageService';
import { toast } from 'react-toastify';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@shared/components/ui/avatar';
import { logout } from '@shared/services/authService';

const SettingsPage = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(
    user?.displayName?.split(' ')[0] || ''
  );
  const [lastName, setLastName] = useState(
    user?.displayName?.split(' ')[1] || ''
  );
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (!user?.uid) return;

      try {
        const userData = await fetchUserProfile(user.uid); // Fetch from Firestore
        if (userData.photoURL) {
          const url = await getFileURL(userData.photoURL); // Use getFileURL to fetch HTTPS URL
          setPhotoURL(url);
        } else {
          console.info('No profile photo found for this user.');
        }
      } catch (error) {
        console.error('Error fetching profile photo:', error);
      }
    };

    fetchProfilePhoto();
  }, [user]);

  const handleSave = async () => {
    try {
      await updateUserProfile({ firstName, lastName, profilePhoto });
      toast.success('Profile updated successfully!');

      if (profilePhoto) {
        const userData = await fetchUserProfile(user?.uid || '');
        if (userData.photoURL) {
          const url = await getFileURL(userData.photoURL); // Use getFileURL to update photo URL
          setPhotoURL(url);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <Avatar className="w-24 h-24">
            {photoURL ? (
              <AvatarImage src={photoURL} alt="User Avatar" />
            ) : (
              <AvatarFallback>
                {`${firstName[0]?.toUpperCase() || 'U'}${
                  lastName[0]?.toUpperCase() || ''
                }`}
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium">First Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium">Last Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        {/* Profile Photo */}
        <div>
          <label className="block text-sm font-medium">Profile Photo</label>
          <input
            type="file"
            accept="image/*"
            className="w-full px-4 py-2 border rounded"
            onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
          />
        </div>

        {/* Save Button */}
        <button
          className="px-4 py-2 text-white bg-blue-500 rounded"
          onClick={handleSave}
        >
          Save
        </button>

        {/* Sign Out Button */}
        <button
          className="px-4 py-2 mt-4 text-white bg-red-500 rounded"
          onClick={logout}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
