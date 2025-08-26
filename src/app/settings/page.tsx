"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/auth";
import ChangePasswordForm from "../components/auth/ChangePasswordForm";
import ChangeDisplayNameForm from "../components/auth/ChangeDisplayNameForm";
import ThemeSelector from "../components/theme/ThemeSelector";

const SettingsPage = () => {
  const { player, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect non-authenticated users to login
    if (!loading && (!player || player.isAnonymous)) {
      router.push("/login");
    }
  }, [player, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4 text-base-content/70">Loading...</p>
      </div>
    );
  }

  // Don't render if user is not authenticated
  if (!player || player.isAnonymous) {
    return null;
  }

  return (
    <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-base-content/70">
          Manage your account settings and preferences
        </p>
      </div>

      {/* User Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Display Name Change Section */}
        <ChangeDisplayNameForm />

        {/* Password Change Section */}
        <ChangePasswordForm />
      </div>

      {/* Appearance Section */}
      <div className="mt-8">
        <ThemeSelector />
      </div>

      {/* Account Information Section */}
      <div className="mt-8">
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-xl mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  value={player.email || ""}
                  className="input input-bordered w-full bg-base-200"
                  disabled
                  readOnly
                />
              </div>
              <div className="text-sm text-base-content/60">
                <p>Account created: {player.metadata.creationTime ? new Date(player.metadata.creationTime).toLocaleDateString() : "Unknown"}</p>
                <p>Last sign in: {player.metadata.lastSignInTime ? new Date(player.metadata.lastSignInTime).toLocaleDateString() : "Unknown"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SettingsPage;