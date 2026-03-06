import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';

export async function jwtCallback({ token, user, trigger }: any) {
  // Initial sign in - add user data to token
  if (user) {
    try {
      await connectDB();
      const dbUser = await User.findOne({ email: user.email });
      
      if (dbUser) {
        token.id = dbUser._id.toString();
        token.role = dbUser.role;
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.picture = dbUser.image;
        token.needsPasswordSetup = dbUser.needsPasswordSetup || false;
        console.log('JWT token created for:', user.email);
      } else {
        console.error('User not found in DB after sign in:', user.email);
      }
    } catch (error) {
      console.error('Error in jwt callback (initial):', error);
    }
  }

  // Handle session updates OR refresh needsPasswordSetup on every request
  if (trigger === 'update' || token.needsPasswordSetup) {
    try {
      await connectDB();
      const dbUser = await User.findOne({ email: token.email });
      
      if (dbUser) {
        token.role = dbUser.role;
        token.name = dbUser.name;
        token.picture = dbUser.image;
        token.needsPasswordSetup = dbUser.needsPasswordSetup || false;
      }
    } catch (error) {
      console.error('Error in jwt callback (update):', error);
    }
  }

  return token;
}
