export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string;
  needsPasswordSetup?: boolean;
}

export interface SessionUser extends AuthUser {
  needsPasswordSetup: boolean;
}
