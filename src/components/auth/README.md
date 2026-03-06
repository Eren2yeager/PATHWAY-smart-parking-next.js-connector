# Authentication Components

Reusable UI components for the authentication system.

## Components

### AuthLayout
Main layout wrapper for authentication pages with animated header, theme toggle, and light rays background.

```tsx
import { AuthLayout } from '@/components/auth';

<AuthLayout 
  title="Welcome to Smart Parking"
  subtitle="Sign in to access your dashboard"
>
  {/* Your content */}
</AuthLayout>
```

**Features:**
- Animated car icon header
- Theme toggle button (top-right corner)
- Animated LightRays background effect
- Mouse-interactive light rays
- Responsive design
- Gradient background with dark mode support
- Proper z-index layering for all elements

### AuthCard
Card container for authentication forms.

```tsx
import { AuthCard } from '@/components/auth';

<AuthCard title="Sign in to continue">
  {/* Form content */}
</AuthCard>
```

### ErrorAlert
Display error messages with animation.

```tsx
import { ErrorAlert } from '@/components/auth';

<ErrorAlert message="Invalid credentials" />
```

### GoogleButton
Google sign-in button with loading state.

```tsx
import { GoogleButton } from '@/components/auth';

<GoogleButton 
  onClick={handleGoogleSignIn}
  disabled={isLoading}
  text="Continue with Google"
/>
```

### OtpInput
6-digit OTP input with auto-focus and paste support.

```tsx
import { OtpInput } from '@/components/auth';

<OtpInput
  value={otp}
  onChange={setOtp}
  disabled={isLoading}
  autoFocus
  length={6}
/>
```

### Divider
Visual divider with centered text.

```tsx
import { Divider } from '@/components/auth';

<Divider text="Or continue with" />
```

### SuccessMessage
Success state display with animation.

```tsx
import { SuccessMessage } from '@/components/auth';

<SuccessMessage
  title="Account Created!"
  message="You'll be redirected shortly."
/>
```

### LoadingSpinner
Full-screen loading spinner.

```tsx
import { LoadingSpinner } from '@/components/auth';

<LoadingSpinner />
```

## Usage Example

```tsx
'use client';

import { useState } from 'react';
import { useSignIn } from '@/hooks/auth';
import { 
  AuthLayout, 
  AuthCard, 
  ErrorAlert, 
  GoogleButton,
  Divider 
} from '@/components/auth';
import { Button } from '@/components/shadcnComponents/button';
import { Input } from '@/components/shadcnComponents/input';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithGoogle, signInWithCredentials, isLoading, error } = useSignIn();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signInWithCredentials(email, password);
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account"
    >
      <AuthCard title="Sign in to continue">
        <ErrorAlert message={error} />
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <Button type="submit" disabled={isLoading}>
            Sign In
          </Button>
        </form>

        <Divider />
        
        <GoogleButton onClick={signInWithGoogle} disabled={isLoading} />
      </AuthCard>
    </AuthLayout>
  );
}
```
