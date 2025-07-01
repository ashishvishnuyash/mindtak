import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  sendEmailVerification,
  updatePassword,
  updateProfile,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/types';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'employer';
  department?: string;
  companyId?: string;
}

// Enhanced error handling
export function getAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      await firebaseSignOut(auth);
      return {
        success: false,
        error: 'User profile not found. Please contact support.'
      };
    }

    const userData = userDoc.data() as User;
    
    return {
      success: true,
      user: {
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        ...userData
      }
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error as AuthError)
    };
  }
}

// Sign up with email and password
export async function signUp(data: SignUpData): Promise<AuthResult> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const firebaseUser = userCredential.user;

    // Update display name
    await updateProfile(firebaseUser, {
      displayName: `${data.firstName} ${data.lastName}`
    });

    // Create user profile in Firestore
    const userProfile: Omit<User, 'id'> = {
      email: data.email,
      role: data.role,
      first_name: data.firstName,
      last_name: data.lastName,
      department: data.department || null,
      company_id: data.companyId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);

    // Send email verification
    if (!firebaseUser.emailVerified) {
      await sendEmailVerification(firebaseUser);
    }

    return {
      success: true,
      user: {
        id: firebaseUser.uid,
        ...userProfile
      }
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error as AuthError)
    };
  }
}

// Sign out
export async function signOut(): Promise<AuthResult> {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error as AuthError)
    };
  }
}

// Send password reset email
export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error as AuthError)
    };
  }
}

// Confirm password reset
export async function confirmPasswordResetCode(code: string, newPassword: string): Promise<AuthResult> {
  try {
    await confirmPasswordReset(auth, code, newPassword);
    return { success: true };
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error as AuthError)
    };
  }
}

// Update user password
export async function updateUserPassword(newPassword: string): Promise<AuthResult> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'No user is currently signed in.'
      };
    }

    await updatePassword(user, newPassword);
    return { success: true };
  } catch (error) {
    console.error('Password update error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error as AuthError)
    };
  }
}

// Send email verification
export async function sendVerificationEmail(): Promise<AuthResult> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'No user is currently signed in.'
      };
    }

    await sendEmailVerification(user);
    return { success: true };
  } catch (error) {
    console.error('Email verification error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error as AuthError)
    };
  }
}