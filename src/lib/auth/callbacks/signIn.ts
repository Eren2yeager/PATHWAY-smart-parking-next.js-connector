import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';

export async function signInCallback({ user, account }: any) {
  try {
    await connectDB();

    if (!user.email) {
      console.error('No email provided');
      return false;
    }

    // Find or create user in database
    let dbUser = await User.findOne({ email: user.email });

    if (!dbUser && account?.provider === 'google') {
      // Create new user with Google auth - needs password setup
      dbUser = await User.create({
        email: user.email,
        name: user.name || 'Unknown User',
        googleId: account?.providerAccountId || '',
        image: user.image,
        role: 'viewer', // Default role
        lastLogin: new Date(),
        needsPasswordSetup: true, // Flag for password setup
      });
      console.log('Created new Google user:', user.email);
    } else if (dbUser) {
      // Update existing user
      dbUser.lastLogin = new Date();
      dbUser.name = user.name || dbUser.name;
      dbUser.image = user.image || dbUser.image;
      
      // Update googleId if signing in with Google
      if (account?.provider === 'google' && account?.providerAccountId) {
        dbUser.googleId = account.providerAccountId;
      }
      
      await dbUser.save();
      console.log('Updated existing user:', user.email);
    }

    return true;
  } catch (error) {
    console.error('Error in signIn callback:', error);
    return false;
  }
}
