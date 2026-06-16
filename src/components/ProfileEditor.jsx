import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Camera, Check, Languages, Mail, Pencil, ShieldCheck, Sparkles, UploadCloud, X } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from './ui';

const normalizeCsv = (value) => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => (typeof item === 'string' ? item.split(',') : []))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value !== 'string') return [];

  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const joinCsv = (value = []) => (Array.isArray(value) ? value.join(', ') : '');
const getResponseUser = (response) => response?.user || response?.data?.user || response?.data || response;

export function ProfileEditor() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    education: '',
    college: '',
    department: '',
    experienceYears: '',
    languages: '',
    skills: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);

  const skillsLabel = useMemo(() => {
    if (user?.role === 'mentor') return 'Skills to teach';
    if (user?.role === 'learner') return 'Skills to learn';
    return 'Skills';
  }, [user?.role]);

  const initialValues = useMemo(() => {
    const skillsArray = user?.role === 'mentor'
      ? user?.skillsToTeach
      : user?.role === 'learner'
      ? user?.skillsToLearn
      : [];

    return {
      name: user?.name || '',
      username: user?.username || '',
      bio: user?.bio || '',
      education: user?.education || '',
      college: user?.college || '',
      department: user?.department || '',
      experienceYears: user?.experienceYears ? String(user.experienceYears) : '',
      languages: joinCsv(user?.languages),
      skills: joinCsv(skillsArray),
    };
  }, [user]);

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const handleFieldChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleCancel = () => {
    setFormData(initialValues);
    setErrors({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    const nextData = {
      name: formData.name.trim(),
      username: formData.username.trim(),
      bio: formData.bio.trim(),
      education: formData.education.trim(),
      college: formData.college.trim(),
      department: formData.department.trim(),
      experienceYears: formData.experienceYears === '' ? 0 : Number(formData.experienceYears),
      languages: normalizeCsv(formData.languages),
    };

    const skillsField = user?.role === 'mentor' ? 'skillsToTeach' : 'skillsToLearn';
    nextData[skillsField] = normalizeCsv(formData.skills);

    const validationErrors = {};
    if (!nextData.name) validationErrors.name = 'Name is required';
    if (!nextData.username) validationErrors.username = 'Username is required';
    if (nextData.bio.length > 1000) validationErrors.bio = 'Bio must be 1000 characters or less';
    if (Number.isNaN(nextData.experienceYears)) {
      validationErrors.experienceYears = 'Experience must be a number';
    } else if (nextData.experienceYears < 0) {
      validationErrors.experienceYears = 'Experience must be 0 or greater';
    }

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const response = await authService.updateProfile(nextData);
      const updatedUser = getResponseUser(response);
      if (updatedUser) setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error?.message || 'Unable to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }

    const payload = new FormData();
    payload.append('avatar', file);
    setAvatarSaving(true);
    try {
      const response = await authService.updateAvatar(payload);
      const updatedUser = getResponseUser(response);
      if (updatedUser) setUser(updatedUser);
      toast.success('Avatar updated');
    } catch (error) {
      toast.error(error?.message || 'Unable to upload avatar');
    } finally {
      setAvatarSaving(false);
      event.target.value = '';
    }
  };

  const profile = {
    name: user?.name || 'User',
    username: user?.username || 'user',
    bio: user?.bio || 'Welcome to LearnLoop',
    role: user?.role || 'learner',
    skills: normalizeCsv(user?.role === 'mentor' ? user?.skillsToTeach : user?.skillsToLearn),
    education: user?.education || 'Not specified',
    college: user?.college || 'Not specified',
    department: user?.department || 'Not specified',
    experience: user?.experienceYears ? `${user.experienceYears} years` : 'Not specified',
    languages: normalizeCsv(user?.languages || []),
    availability: user?.availability || 'Not specified',
    rating: user?.averageRating || 0,
  };

  const avatarSrc = user?.avatar || '';

  return (
    <GlassCard className="overflow-hidden p-0">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleAvatarChange}
      />

      <div className="relative min-h-48 bg-[linear-gradient(135deg,#0f766e,#2563eb_50%,#7c3aed)]">
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="relative flex h-full min-h-48 items-end justify-between gap-4 p-6 text-white">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] backdrop-blur">
              <ShieldCheck size={14} /> {profile.role}
            </p>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl">{profile.name}</h1>
            <p className="mt-1 text-sm text-blue-100">@{profile.username}</p>
          </div>
          <div className="hidden rounded-2xl bg-white/12 px-4 py-3 text-sm font-bold backdrop-blur sm:flex sm:items-center sm:gap-2">
            <Sparkles size={18} /> LearnLoop profile
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 sm:px-6">
        <div className="-mt-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="group relative h-28 w-28 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-soft dark:border-slate-950 dark:bg-slate-900">
              {avatarSrc ? (
                <img src={avatarSrc} alt={`${profile.name} avatar`} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-slate-100 text-4xl font-black text-blue-600 dark:bg-slate-800">
                  {profile.name.charAt(0)}
                </div>
              )}
              <button
                type="button"
                className="absolute inset-x-2 bottom-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950/80 px-3 py-2 text-xs font-black text-white opacity-100 backdrop-blur transition sm:opacity-0 sm:group-hover:opacity-100"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarSaving}
                aria-label="Upload avatar"
              >
                {avatarSaving ? <UploadCloud size={14} /> : <Camera size={14} />}
                {avatarSaving ? 'Uploading' : 'Avatar'}
              </button>
            </div>

            <div className="pb-1">
              {isEditing ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={(event) => handleFieldChange('name', event.target.value)}
                      disabled={saving}
                    />
                    {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="Username"
                      value={formData.username}
                      onChange={(event) => handleFieldChange('username', event.target.value)}
                      disabled={saving}
                    />
                    {errors.username && <p className="mt-1 text-sm text-rose-500">{errors.username}</p>}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip capitalize">{profile.role}</span>
                  {user?.email && <span className="chip"><Mail size={14} /> {user.email}</span>}
                  {profile.languages.length > 0 && <span className="chip"><Languages size={14} /> {profile.languages.slice(0, 2).join(', ')}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isEditing ? (
              <>
                <button className="btn btn-ghost" type="button" onClick={handleCancel} disabled={saving}>
                  <X size={18} /> Cancel
                </button>
                <button className="btn btn-primary" type="button" onClick={handleSave} disabled={saving}>
                  <Check size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button className="btn btn-primary" type="button" onClick={() => setIsEditing(true)}>
                <Pencil size={18} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="mt-6 grid gap-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Bio</label>
              <textarea
                className="input min-h-[140px] w-full resize-none"
                value={formData.bio}
                onChange={(event) => handleFieldChange('bio', event.target.value)}
                disabled={saving}
                rows={5}
              />
              {errors.bio && <p className="mt-1 text-sm text-rose-500">{errors.bio}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ProfileInput label="Education" value={formData.education} onChange={(value) => handleFieldChange('education', value)} disabled={saving} />
              <ProfileInput label="College / institution" value={formData.college} onChange={(value) => handleFieldChange('college', value)} disabled={saving} />
              <ProfileInput label="Department" value={formData.department} onChange={(value) => handleFieldChange('department', value)} disabled={saving} />
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Experience years</label>
                <input
                  type="number"
                  min="0"
                  className="input w-full"
                  value={formData.experienceYears}
                  onChange={(event) => handleFieldChange('experienceYears', event.target.value)}
                  disabled={saving}
                />
                {errors.experienceYears && <p className="mt-1 text-sm text-rose-500">{errors.experienceYears}</p>}
              </div>
              <ProfileInput label="Languages" placeholder="English, Hindi, Spanish" value={formData.languages} onChange={(value) => handleFieldChange('languages', value)} disabled={saving} />
              <ProfileInput label={skillsLabel} placeholder="React, Node.js, UI Design" value={formData.skills} onChange={(value) => handleFieldChange('skills', value)} disabled={saving} />
            </div>
          </div>
        ) : (
          <>
            <p className="mt-6 max-w-3xl leading-7 text-slate-600 dark:text-slate-300">{profile.bio}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ['Experience', profile.experience],
                ['Education', profile.education],
                ['College', profile.college],
                ['Department', profile.department],
                ['Availability', typeof profile.availability === 'string' ? profile.availability : 'Not specified'],
                ['Languages', profile.languages.length ? profile.languages.join(', ') : 'Not specified'],
                ['Ratings', `${profile.rating}/5`],
                ['Reviews', user?.totalRatings ? `${user.totalRatings} reviews` : '0 reviews'],
                ['Completed sessions', user?.sessionsCompleted || 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
                  <p className="mt-2 break-words font-black">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.skills.length ? profile.skills.map((skill) => (
                <span key={skill} className="chip">{skill}</span>
              )) : (
                <p className="text-sm text-slate-500">No skills added yet</p>
              )}
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
}

function ProfileInput({ label, value, onChange, disabled, placeholder = '' }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <input
        type="text"
        className="input w-full"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
