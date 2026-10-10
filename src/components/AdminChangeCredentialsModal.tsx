import React, { useState } from 'react';
import {
  KeyRound,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Save,
} from 'lucide-react';

interface AdminChangeCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  onCredentialsUpdated: (newUsername: string) => void;
}

export const AdminChangeCredentialsModal: React.FC<AdminChangeCredentialsModalProps> = ({
  isOpen,
  onClose,
  currentUsername,
  onCredentialsUpdated,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState(currentUsername || 'admin');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  // Real-time checks
  const isPasswordMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordTooShort = newPassword.length > 0 && newPassword.length < 4;
  const isUsernameTooShort = newUsername.trim().length < 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage('Please enter your current password to authorize this change.');
      return;
    }

    if (isUsernameTooShort) {
      setErrorMessage('New username must be at least 3 characters long.');
      return;
    }

    if (isPasswordTooShort) {
      setErrorMessage('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/change-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newUsername: newUsername.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage('Credentials updated successfully!');
        // Update local session
        localStorage.setItem(
          'agricare_admin_session',
          JSON.stringify({
            isLoggedIn: true,
            username: data.username,
            loginTime: new Date().toISOString(),
          })
        );
        onCredentialsUpdated(data.username);

        // Auto close after brief delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage(data.error || 'Failed to update credentials. Please check your current password.');
      }
    } catch (err: any) {
      setErrorMessage('Network error while updating credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefault = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/reset-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage('Reset to default: Username "admin" and Password "admin123"');
        setNewUsername('admin');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowResetConfirm(false);

        localStorage.setItem(
          'agricare_admin_session',
          JSON.stringify({
            isLoggedIn: true,
            username: 'admin',
            loginTime: new Date().toISOString(),
          })
        );
        onCredentialsUpdated('admin');
      } else {
        setErrorMessage(data.error || 'Could not reset credentials');
      }
    } catch {
      setErrorMessage('Error resetting credentials to default');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="change-credentials-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="change-credentials-modal-card"
        className="relative w-full max-w-lg bg-white dark:bg-[#101912] rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-900/60 overflow-hidden animate-in zoom-in-95 duration-200 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md ring-4 ring-emerald-700/50">
              <KeyRound className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-800 text-emerald-200 border border-emerald-600/40">
                Security Settings
              </span>
              <h2 className="text-xl font-extrabold text-white mt-1 font-['Outfit',sans-serif]">
                Change Admin Credentials
              </h2>
            </div>
          </div>
          <p className="text-xs text-emerald-200/90 mt-2">
            Update your administrative login username and password. You will need your current password to save changes.
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Status Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900 dark:text-red-200">Update Failed</p>
                <p className="mt-0.5 text-red-700 dark:text-red-300">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950 dark:text-emerald-100">{successMessage}</p>
                <p className="text-emerald-700 dark:text-emerald-300 text-[11px]">Your new credentials are now active.</p>
              </div>
            </div>
          )}

          {/* Current Password Verification */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#152317] border border-stone-200/90 dark:border-emerald-800 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="current-admin-password" className="block text-xs font-bold text-emerald-950 dark:text-emerald-200">
                Current Password <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">Required for security</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 dark:text-emerald-400" />
              <input
                id="current-admin-password"
                type={showCurrentPass ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password (default: admin123)"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#101912] border border-stone-300 dark:border-emerald-700 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/15 text-sm font-medium text-emerald-950 dark:text-emerald-100 outline-hidden placeholder-stone-400 dark:placeholder-stone-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 p-1 transition-colors"
                title={showCurrentPass ? 'Hide password' : 'Show password'}
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="border-t border-stone-100 dark:border-emerald-900/40 pt-2 space-y-4">
            {/* New Username Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="new-admin-username" className="block text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  New Admin Username
                </label>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">Min. 3 characters</span>
              </div>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <input
                  id="new-admin-username"
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#152317] border border-stone-200 dark:border-emerald-800 focus:border-emerald-600 focus:bg-white dark:focus:bg-[#101912] focus:ring-3 focus:ring-emerald-500/15 text-sm font-medium text-emerald-950 dark:text-emerald-100 outline-hidden placeholder-stone-400 dark:placeholder-stone-500"
                />
              </div>
            </div>

            {/* New Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="new-admin-password" className="block text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  New Password
                </label>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">Min. 4 characters</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <input
                  id="new-admin-password"
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-50 dark:bg-[#152317] border border-stone-200 dark:border-emerald-800 focus:border-emerald-600 focus:bg-white dark:focus:bg-[#101912] focus:ring-3 focus:ring-emerald-500/15 text-sm font-medium text-emerald-950 dark:text-emerald-100 outline-hidden placeholder-stone-400 dark:placeholder-stone-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 p-1 transition-colors"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="confirm-admin-password" className="block text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  Confirm New Password
                </label>
                {confirmPassword.length > 0 && (
                  <span
                    className={`text-[11px] font-semibold flex items-center gap-1 ${
                      isPasswordMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                    }`}
                  >
                    {isPasswordMatch ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Passwords match
                      </>
                    ) : (
                      'Passwords do not match'
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <input
                  id="confirm-admin-password"
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-50 dark:bg-[#152317] border text-sm font-medium text-emerald-950 dark:text-emerald-100 outline-hidden transition-all ${
                    confirmPassword.length > 0
                      ? isPasswordMatch
                        ? 'border-emerald-500 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/15'
                        : 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-3 focus:ring-red-500/15'
                      : 'border-stone-200 dark:border-emerald-800 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 p-1 transition-colors"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Default Reset Accordion */}
          <div className="pt-2 border-t border-stone-100 dark:border-emerald-900/40">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-[11px] text-stone-500 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Forgot password or need to reset credentials back to default?</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Reset to default admin credentials?</span>
                </div>
                <p className="text-amber-800 dark:text-amber-300 text-[11px]">
                  This will reset the username to <strong>admin</strong> and password to <strong>admin123</strong>.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    disabled={isLoading}
                    className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 rounded-lg bg-white dark:bg-[#152317] border border-stone-200 dark:border-emerald-800 text-stone-700 dark:text-emerald-300 text-[11px] font-medium hover:bg-stone-50 dark:hover:bg-[#1b2f1f] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-emerald-800 hover:bg-stone-50 dark:hover:bg-[#152317] text-stone-700 dark:text-emerald-300 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-credentials-submit-btn"
              type="submit"
              disabled={isLoading || !isPasswordMatch || isPasswordTooShort || isUsernameTooShort}
              className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 active:scale-98 text-white text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Credentials</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
