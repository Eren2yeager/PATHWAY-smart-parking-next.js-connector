export async function sessionCallback({ session, token }: any) {
  if (token && session.user) {
    session.user.id = token.id;
    session.user.role = token.role;
    session.user.email = token.email;
    session.user.name = token.name;
    session.user.image = token.picture;
    session.user.needsPasswordSetup = token.needsPasswordSetup;
  }

  return session;
}
