import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  UserRound
} from 'lucide-react';
import { Logo } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { dashboardPathForRole } from '../routes/routeUtils';

/* -------------------- AUTH SHELL -------------------- */
function AuthShell({ children, title, text }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1fr]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 p-10 lg:flex lg:flex-col">
          <div className="absolute inset-0 hero-grid opacity-35" />
          <Logo />

          <div className="relative mt-auto max-w-xl">
            <div className="mb-8 grid gap-4">
              {[
                'Verified mentor discovery',
                'Live session management',
                'Resource and rating workflows'
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-3xl bg-white/12 p-4 backdrop-blur"
                >
                  <span className="grid size-10 place-items-center rounded-2xl bg-white/20">
                    <Check />
                  </span>
                  <b>{item}</b>
                </div>
              ))}
            </div>

            <h1 className="text-5xl font-black">{title}</h1>
            <p className="mt-5 text-lg text-blue-100">{text}</p>
          </div>
        </div>

        <div className="grid place-items-center bg-canvas p-4 sm:p-8">
          <div className="w-full max-w-xl">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- LOGIN -------------------- */
export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await login({
        identifier: data.identifier,
        password: data.password
      });

      const authData = response?.data || response || {};
      const role = authData?.data?.user?.role || authData?.user?.role;

      navigate(dashboardPathForRole(role));

    } catch (err) {
      toast.error(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back to LearnLoop" text="Continue your learning journey">
      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 sm:p-8">
        <Logo />

        <h2 className="mt-8 text-3xl font-black">Login</h2>

        <label className="field mt-8">
          <span>Username or email</span>
          <input {...register('identifier', { required: true })} />
          {errors.identifier && <small>Username or email required</small>}
        </label>

        <label className="field mt-4">
          <span>Password</span>
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', { required: true })}
            />
            <button type="button" onClick={() => setShowPassword(v => !v)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        <button disabled={loading} className="btn btn-primary mt-6 w-full">
          {loading ? 'Signing in...' : 'Login'} <ArrowRight />
        </button>

        <div className="mt-5 grid gap-3 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Do not have an account yet?</p>
          <Link to="/register" className="btn btn-ghost w-full justify-center">
            Create account
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

/* -------------------- REGISTER -------------------- */

const steps = ['Common details', 'Role', 'Role details', 'Review'];

const toArray = (value) =>
  value?.split(',').map((v) => v.trim()).filter(Boolean) || [];

const roleOptions = [
  {
    key: 'learner',
    title: 'Learner',
    subtitle: 'Find mentors and build your skills.',
    icon: GraduationCap,
    accent: 'from-sky-500 to-blue-600'
  },
  {
    key: 'mentor',
    title: 'Mentor',
    subtitle: 'Share your experience with learners.',
    icon: UserRound,
    accent: 'from-emerald-500 to-teal-600'
  },
  {
    key: 'admin',
    title: 'Admin',
    subtitle: 'Manage programs and the community.',
    icon: ShieldCheck,
    accent: 'from-violet-500 to-fuchsia-600'
  }
];

export function Register() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: { role: 'learner' }
  });

  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const values = watch();
  const selectedRole = watch('role');

  const next = () => {
    if (step === 1 && !selectedRole) {
      toast.error('Please select a role');
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data) => {
    if (step < steps.length - 1) {
      if (step === 0 && data.password !== data.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      next();
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        bio: data.bio || '',
        education: data.education || '',
        college: data.college || '',
        department: data.department || '',
        languages: toArray(data.languages),
      };

      if (data.role === 'learner') {
        payload.skillsToLearn = toArray(data.skillsToLearn);
        payload.level = data.level || 'beginner';
      }

      if (data.role === 'mentor') {
        payload.skillsToTeach = toArray(data.skillsToTeach);
        payload.experienceYears = Number(data.experienceYears || 0);
        payload.level = data.level || 'intermediate';
      }

      if (data.role === 'admin') {
        payload.skillsToTeach = [];
        payload.skillsToLearn = [];
        payload.experienceYears = Number(data.experienceYears || 0);
      }

      await registerUser(payload);

      navigate(dashboardPathForRole(data.role));
    } catch (err) {
      toast.error(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Build your learning loop" text="Create your profile with the right role and details.">
      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 sm:p-8">
        <Logo />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-blue-600">Register</p>
            <h2 className="mt-3 text-3xl font-black text-blue-600 dark:text-blue-400">
  {steps[step]}
</h2>
          </div>
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`h-2 w-full rounded-full ${
                  index <= step ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="mt-8 space-y-6"
          >
            {step === 0 && (
              <div className="grid gap-6">
                <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-950/75">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Common account details</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Start with the details that apply to every LearnLoop user.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="field">
                      <span>Name</span>
                      <input
                        type="text"
                        {...registerField('name', { required: 'Name is required' })}
                        placeholder="Your full name"
                      />
                      {errors.name && <small>{errors.name.message}</small>}
                    </label>

                    <label className="field">
                      <span>Username</span>
                      <input
                        type="text"
                        {...registerField('username', { required: 'Username is required' })}
                        placeholder="Choose a username"
                      />
                      {errors.username && <small>{errors.username.message}</small>}
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="field">
                      <span>Email</span>
                      <input
                        type="email"
                        {...registerField('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Enter a valid email address'
                          }
                        })}
                        placeholder="you@example.com"
                      />
                      {errors.email && <small>{errors.email.message}</small>}
                    </label>

                    <label className="field">
                      <span>Password</span>
                      <input
                        type="password"
                        {...registerField('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Password must be at least 8 characters' }
                        })}
                        placeholder="Create a password"
                      />
                      {errors.password && <small>{errors.password.message}</small>}
                    </label>
                  </div>

                  <label className="field">
                    <span>Confirm password</span>
                    <input
                      type="password"
                      {...registerField('confirmPassword', {
                        required: 'Confirm your password',
                        validate: (value) => value === watch('password') || 'Passwords do not match'
                      })}
                      placeholder="Repeat your password"
                    />
                    {errors.confirmPassword && <small>{errors.confirmPassword.message}</small>}
                  </label>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  {roleOptions.map(({ key, title, subtitle, icon: Icon, accent }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setValue('role', key);
                      }}
                      className={`group flex flex-col gap-4 rounded-[2rem] border p-6 text-left transition ${
                        selectedRole === key
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/80'
                      }`}
                    >
                      <div className={`inline-flex rounded-3xl bg-gradient-to-br ${accent} p-3 text-white`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <input type="hidden" {...registerField('role')} />
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-6">
                <div className="rounded-[2rem] border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-950/75">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">{selectedRole}</p>
                      <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Role-specific setup</h3>
                    </div>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
                      {selectedRole === 'learner'
                        ? 'Learner profile'
                        : selectedRole === 'mentor'
                        ? 'Mentor profile'
                        : 'Admin profile'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Add the information that helps us match you to the right mentors, learners, or programs.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {selectedRole === 'learner' && (
                    <>
                      <label className="field">
                        <span>Skills to learn</span>
                        <input
                          type="text"
                          {...registerField('skillsToLearn')}
                          placeholder="e.g. product design, Python, marketing"
                        />
                      </label>
                      <label className="field">
                        <span>Learning level</span>
                        <select {...registerField('level')} className="input">
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </label>
                    </>
                  )}

                  {selectedRole === 'mentor' && (
                    <>
                      <label className="field">
                        <span>Skills to teach</span>
                        <input
                          type="text"
                          {...registerField('skillsToTeach')}
                          placeholder="e.g. React, career coaching, public speaking"
                        />
                      </label>
                      <label className="field">
                        <span>Years of experience</span>
                        <input
                          type="number"
                          min="0"
                          {...registerField('experienceYears')}
                          placeholder="e.g. 3"
                        />
                      </label>
                    </>
                  )}

                  {selectedRole === 'admin' && (
                    <>
                      <label className="field">
                        <span>Team / department</span>
                        <input
                          type="text"
                          {...registerField('department')}
                          placeholder="e.g. Program operations"
                        />
                      </label>
                      <label className="field">
                        <span>Years in operations</span>
                        <input
                          type="number"
                          min="0"
                          {...registerField('experienceYears')}
                          placeholder="e.g. 5"
                        />
                      </label>
                    </>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="field">
                    <span>Education</span>
                    <input type="text" {...registerField('education')} placeholder="e.g. MBA, B.Tech" />
                  </label>
                  <label className="field">
                    <span>College / institution</span>
                    <input type="text" {...registerField('college')} placeholder="e.g. National Institute" />
                  </label>
                </div>

                <label className="field">
                  <span>Languages</span>
                  <input type="text" {...registerField('languages')} placeholder="e.g. English, Hindi" />
                </label>

                <label className="field">
                  <span>Bio</span>
                  <textarea {...registerField('bio')} placeholder="Tell us about yourself" />
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-950/75">
                <h3 className="text-xl font-semibold">Review your registration</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['Name', values.name],
                    ['Username', values.username],
                    ['Email', values.email],
                    ['Role', values.role],
                    ['Department', values.department],
                    ['Education', values.education],
                    ['College', values.college],
                    ['Languages', values.languages],
                    ['Bio', values.bio]
                  ].map(([label, value]) => (
                    value ? (
                      <div key={label} className="rounded-3xl bg-white/80 p-4 text-sm text-slate-700 shadow-sm dark:bg-slate-900/80 dark:text-slate-200">
                        <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
                        <p className="mt-2 break-words">{value}</p>
                      </div>
                    ) : null
                  ))}
                  {selectedRole === 'learner' && values.skillsToLearn && (
                    <div className="rounded-3xl bg-white/80 p-4 text-sm text-slate-700 shadow-sm dark:bg-slate-900/80 dark:text-slate-200">
                      <p className="font-semibold text-slate-900 dark:text-white">Skills to learn</p>
                      <p className="mt-2 break-words">{values.skillsToLearn}</p>
                    </div>
                  )}
                  {selectedRole === 'mentor' && values.skillsToTeach && (
                    <div className="rounded-3xl bg-white/80 p-4 text-sm text-slate-700 shadow-sm dark:bg-slate-900/80 dark:text-slate-200">
                      <p className="font-semibold text-slate-900 dark:text-white">Skills to teach</p>
                      <p className="mt-2 break-words">{values.skillsToTeach}</p>
                    </div>
                  )}
                  {(selectedRole === 'mentor' || selectedRole === 'admin') && values.experienceYears !== undefined && (
                    <div className="rounded-3xl bg-white/80 p-4 text-sm text-slate-700 shadow-sm dark:bg-slate-900/80 dark:text-slate-200">
                      <p className="font-semibold text-slate-900 dark:text-white">Experience years</p>
                      <p className="mt-2">{values.experienceYears || '0'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="btn btn-ghost w-full justify-center sm:w-auto"
          >
            Back
          </button>

          <button type="submit" className="btn btn-primary w-full justify-center sm:w-auto" disabled={loading}>
            {step === steps.length - 1 ? (loading ? 'Creating...' : 'Submit') : 'Continue'}
            <ArrowRight />
          </button>
        </div>
      </form>
    </AuthShell>
  );
}

/* -------------------- FORGOT PASSWORD -------------------- */
export function ForgotPassword() {
  const { register, handleSubmit } = useForm();

  return (
    <AuthShell title="Reset Password" text="We will send reset link">
      <form onSubmit={handleSubmit(() => toast.success('Sent'))}>
        <input type="email" {...register('email', { required: true })} />
        <button className="btn btn-primary mt-4">
          Send <BookOpen />
        </button>
      </form>
    </AuthShell>
  );
}
