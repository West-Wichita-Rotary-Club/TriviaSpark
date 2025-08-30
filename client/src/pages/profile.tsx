import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Calendar, Edit, Save, X } from "lucide-react";
import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { formatDateInCST } from "@/lib/utils";

type ProfileForm = {
  fullName: string;
  email: string;
  username: string;
};

export default function Profile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading } = useQuery<{
    user: {
      id: string;
      username: string;
      email: string;
      fullName: string;
      createdAt: string;
    };
  }>({
    queryKey: ["/api/auth/me"],
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Update failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const handleEdit = () => {
    if (user?.user) {
      reset({
        fullName: user.user.fullName,
        email: user.user.email,
        username: user.user.username,
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900" data-testid="text-profile-title">
              User Profile
            </h1>
            <p className="text-gray-600" data-testid="text-profile-subtitle">
              Manage your account information and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <Card className="trivia-card" data-testid="card-profile-overview">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24" data-testid="avatar-profile">
                    <AvatarFallback className="wine-gradient text-white text-2xl font-bold">
                      {user?.user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl" data-testid="text-user-name">
                  {user?.user?.fullName || 'User'}
                </CardTitle>
                <p className="text-gray-600" data-testid="text-user-username">
                  @{user?.user?.username}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span data-testid="text-member-since">
                      Member since {user?.user?.createdAt ? formatDateInCST(user.user.createdAt) : 'Unknown'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card className="trivia-card" data-testid="card-profile-info">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center" data-testid="text-profile-info-title">
                      <User className="mr-2 h-5 w-5" />
                      Profile Information
                    </CardTitle>
                    {!isEditing && (
                      <Button
                        onClick={handleEdit}
                        variant="outline"
                        size="sm"
                        data-testid="button-edit-profile"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div>
                        <Label htmlFor="fullName" data-testid="label-full-name">
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          {...register("fullName", { required: "Full name is required" })}
                          className="mt-1"
                          data-testid="input-full-name"
                        />
                        {errors.fullName && (
                          <p className="text-sm text-red-500 mt-1" data-testid="error-full-name">
                            {errors.fullName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email" data-testid="label-email">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email", { 
                            required: "Email is required",
                            pattern: {
                              value: /\S+@\S+\.\S+/,
                              message: "Enter a valid email address"
                            }
                          })}
                          className="mt-1"
                          data-testid="input-email"
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500 mt-1" data-testid="error-email">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="username" data-testid="label-username">
                          Username
                        </Label>
                        <Input
                          id="username"
                          {...register("username", { required: "Username is required" })}
                          className="mt-1"
                          data-testid="input-username"
                        />
                        {errors.username && (
                          <p className="text-sm text-red-500 mt-1" data-testid="error-username">
                            {errors.username.message}
                          </p>
                        )}
                      </div>

                      <div className="flex space-x-4">
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="trivia-button-primary"
                          data-testid="button-save-profile"
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCancel}
                          variant="outline"
                          data-testid="button-cancel-edit"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <Label className="text-gray-600">Full Name</Label>
                        <p className="font-medium mt-1" data-testid="text-display-full-name">
                          {user?.user?.fullName || 'Not set'}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-gray-600">Email Address</Label>
                        <div className="flex items-center mt-1">
                          <Mail className="mr-2 h-4 w-4 text-gray-500" />
                          <p className="font-medium" data-testid="text-display-email">
                            {user?.user?.email || 'Not set'}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-gray-600">Username</Label>
                        <p className="font-medium mt-1" data-testid="text-display-username">
                          @{user?.user?.username || 'Not set'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}