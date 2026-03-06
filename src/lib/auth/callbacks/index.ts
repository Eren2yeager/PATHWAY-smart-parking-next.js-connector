import { signInCallback } from './signIn';
import { redirectCallback } from './redirect';
import { jwtCallback } from './jwt';
import { sessionCallback } from './session';

export const authCallbacks = {
  signIn: signInCallback,
  redirect: redirectCallback,
  jwt: jwtCallback,
  session: sessionCallback,
};
