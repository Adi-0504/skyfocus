import React, { useState } from 'react';
import { User, Globe, Bell, LogOut, Check, ShieldCheck, Moon, Laptop } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types/database';

export const SettingsView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { profile, user, updateProfile, signOut } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [language, setLanguage] = useState<Language>((profile?.language as Language) || 'zh-TW');
  const [notificationStatus, setNotificationStatus] = useState<string>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSavedSuccess(false);

    await updateProfile({
      display_name: displayName,
      language: language,
    });

    i18n.changeLanguage(language);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationStatus(perm);
    }
  };

  return (
    <div className="min-h-screen sky-bg pb-32 pt-6 px-4 max-w-lg mx-auto fade-in">
      {/* Top Header */}
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold text-white tracking-wide mb-1">
          {t('settings.title')}
        </h1>
      </div>

      {savedSuccess && (
        <div className="sky-card p-3 mb-4 bg-emerald-100 text-emerald-800 flex items-center gap-2 text-xs font-semibold">
          <Check className="w-4 h-4" />
          <span>{t('settings.saved_success')}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Profile Group */}
        <div className="sky-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#68828C] border-b border-[#475A61]/10 pb-2">
            <User className="w-4 h-4" />
            <span>{t('settings.profile_section')}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#E2DEC3] text-[#475A61] flex items-center justify-center font-bold text-xl shadow-md">
              {displayName ? displayName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[#68828C] mb-1">{t('settings.display_name')}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full sky-input px-3 py-1.5 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#68828C] mb-1">{t('settings.email')}</label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full sky-input px-3 py-1.5 text-sm opacity-60 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Preferences Group */}
        <div className="sky-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#68828C] border-b border-[#475A61]/10 pb-2">
            <Globe className="w-4 h-4" />
            <span>{t('settings.preferences_section')}</span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#475A61]">{t('settings.language')}</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="sky-input px-3 py-1.5 text-xs font-semibold cursor-pointer"
            >
              <option value="zh-TW">繁體中文 (Traditional Chinese)</option>
              <option value="en">English</option>
              <option value="ja">日本語 (Japanese)</option>
            </select>
          </div>

          {/* Push Notifications Switcher */}
          <div className="flex items-center justify-between border-t border-[#475A61]/10 pt-3">
            <div>
              <div className="text-sm font-semibold text-[#475A61] flex items-center gap-1.5">
                <Bell className="w-4 h-4" />
                <span>{t('settings.notifications')}</span>
              </div>
              <p className="text-[11px] text-[#68828C] mt-0.5">
                {t('settings.enable_notifications')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRequestNotification}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                notificationStatus === 'granted'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'sky-button-secondary'
              }`}
            >
              {notificationStatus === 'granted'
                ? t('settings.notification_status_enabled')
                : t('settings.notification_status_disabled')}
            </button>
          </div>
        </div>

        {/* Save Changes Button */}
        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="w-full sky-button-primary py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg"
        >
          <span>{isSaving ? t('common.loading') : t('settings.save')}</span>
        </button>

        {/* Account & Logout */}
        <div className="sky-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#68828C] border-b border-[#475A61]/10 pb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('settings.account_section')}</span>
          </div>

          <button
            onClick={() => signOut()}
            className="w-full py-2.5 px-4 bg-rose-100 hover:bg-rose-200 text-rose-700 font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('settings.logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
