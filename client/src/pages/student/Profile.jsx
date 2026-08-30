import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Mail,
  Shield,
  BookOpen,
  Edit3,
  Sparkles,
  Github,
  Linkedin,
  Globe,
  Briefcase,
  Info,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Course from "./Course";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/authApi";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";


function Profile() {
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [profilePhoto, setProfilePhoto] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const { data, isLoading, refetch } = useLoadUserQuery();
  const [
    updateUser,
    {
      data: updateUserData,
      isLoading: updateUserIsLoading,
      isError,
      error,
      isSuccess,
    },
  ] = useUpdateUserMutation();

  const user = data?.user;
  const enrolledCourses = user?.enrolledCourses || [];

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setHeadline(user.headline || "");
      setBio(user.bio || "");
      setGithubUrl(user.githubUrl || "");
      setLinkedinUrl(user.linkedinUrl || "");
      setWebsiteUrl(user.websiteUrl || "");
    }
  }, [user]);

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const updateUserHandler = async () => {
    const formData = new FormData();
    formData.append("name", name || "");
    formData.append("headline", headline || "");
    formData.append("bio", bio || "");
    formData.append("githubUrl", githubUrl || "");
    formData.append("linkedinUrl", linkedinUrl || "");
    formData.append("websiteUrl", websiteUrl || "");

    if (profilePhoto) {
      formData.append("profilePhoto", profilePhoto);
    }

    await updateUser(formData);
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(updateUserData?.message || "Profile updated successfully!");
      setOpenEditDialog(false);
    }
    if (isError) {
      toast.error(error?.data?.message || "Failed to update profile.");
    }
  }, [error, isError, updateUserData, isSuccess, refetch]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-6 space-y-6">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-blue-500/20 shadow-lg shrink-0">
              <AvatarImage
                src={photoPreview || user?.photoUrl || "https://github.com/shadcn.png"}
                alt={user?.name}
              />
              <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "SS"}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {user?.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 capitalize">
                  {user?.role || "Student"}
                </span>
              </div>

              {user?.headline && (
                <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center md:justify-start gap-1.5">
                  <Briefcase size={14} />
                  {user.headline}
                </p>
              )}

              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-1.5">
                <Mail size={15} />
                {user?.email}
              </p>

              {user?.bio && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl pt-1">
                  {user.bio}
                </p>
              )}

              {/* Social Media Link Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                {user?.githubUrl && (
                  <a
                    href={user.githubUrl.startsWith("http") ? user.githubUrl : `https://${user.githubUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    <Github size={13} /> GitHub
                  </a>
                )}
                {user?.linkedinUrl && (
                  <a
                    href={user.linkedinUrl.startsWith("http") ? user.linkedinUrl : `https://${user.linkedinUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                  >
                    <Linkedin size={13} /> LinkedIn
                  </a>
                )}
                {user?.websiteUrl && (
                  <a
                    href={user.websiteUrl.startsWith("http") ? user.websiteUrl : `https://${user.websiteUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 hover:bg-purple-100 transition-colors"
                  >
                    <Globe size={13} /> Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>

          <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 gap-2 font-semibold shadow-sm hover:bg-slate-800 shrink-0">
                <Edit3 size={16} />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Profile Details</DialogTitle>
                <DialogDescription>
                  Personalize your profile info, bio, and social links.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Profile Photo</Label>
                  <Input
                    onChange={onChangeHandler}
                    type="file"
                    accept="image/*"
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Full Name</Label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Akshat"
                      className="rounded-xl border-slate-200 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Headline / Title</Label>
                    <Input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Fullstack Developer"
                      className="rounded-xl border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Bio / About You</Label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a little bit about your learning journey..."
                    className="flex w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none dark:border-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Social & Website Links
                  </Label>

                  <div className="space-y-2">
                    <div className="relative">
                      <Github className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="pl-9 rounded-xl border-slate-200 text-xs"
                      />
                    </div>

                    <div className="relative">
                      <Linkedin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="pl-9 rounded-xl border-slate-200 text-xs"
                      />
                    </div>

                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://yourportfolio.com"
                        className="pl-9 rounded-xl border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  disabled={updateUserIsLoading}
                  onClick={updateUserHandler}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold h-10"
                >
                  {updateUserIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    "Save Profile Changes"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* User Stats Overview Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Enrolled Courses</p>
              <p className="font-bold text-lg text-slate-900 dark:text-white">{enrolledCourses.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Account Type</p>
              <p className="font-bold text-lg text-slate-900 dark:text-white capitalize">{user?.role || "Student"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Member Status</p>
              <p className="font-bold text-lg text-slate-900 dark:text-white">Active Student</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Gallery */}
      <div className="space-y-4">
        <h2 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen size={20} className="text-blue-600" />
          Enrolled Courses
        </h2>

        {enrolledCourses.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
            <p className="text-slate-500 dark:text-slate-400 text-sm">You haven't enrolled in any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Course course={course} key={course._id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;


