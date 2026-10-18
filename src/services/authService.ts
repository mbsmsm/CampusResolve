import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import type { UserProfile } from '../types';

// Key for local storage mock session when Firebase credentials are not set
const MOCK_USER_STORAGE_KEY = 'complaint_system_mock_user';

// Demo accounts for preview testing before Firebase keys are entered
export const DEMO_STUDENT: UserProfile = {
  uid: 'demo-student-uid',
  email: 'student@campus.edu',
  displayName: 'Rahul Sharma',
  role: 'student',
  studentIdNumber: 'CS2026-042',
  department: 'Computer Science',
  createdAt: new Date().toISOString(),
};

export const DEMO_ADMIN: UserProfile = {
  uid: 'demo-admin-uid',
  email: 'admin@campus.edu',
  displayName: 'Dr. Anita Menon (Chief Warden)',
  role: 'admin',
  department: 'College Grievance Cell',
  createdAt: new Date().toISOString(),
};

/**
 * Format raw Firebase errors into clear, friendly error messages.
 */
export function formatAuthError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a password with at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact the campus administrator.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to multiple failed login attempts. Please wait a few moments or reset your password.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in Firebase Console. Please enable it under Authentication > Sign-in method.';
    case 'permission-denied':
      return 'Firestore permission denied. Please copy and publish the updated firestore.rules in your Firebase Console (Firestore Database > Rules).';
    default:
      return error?.message || 'An unexpected authentication error occurred. Please try again.';
  }
}

/**
 * Register a new student.
 * STRICT SECURITY: Public registration CAN ONLY set role = 'student'.
 */
export async function registerStudent(
  email: string,
  pass: string,
  displayName: string,
  studentIdNumber?: string,
  department?: string
): Promise<UserProfile> {
  if (!isFirebaseConfigured) {
    // Local demo registration
    const newStudent: UserProfile = {
      uid: 'student_' + Date.now(),
      email,
      displayName,
      role: 'student', // Enforce student role
      studentIdNumber: studentIdNumber || 'STU-' + Math.floor(1000 + Math.random() * 9000),
      department: department || 'General',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(newStudent));
    return newStudent;
  }

  try {
    // Real Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Update display name in Firebase Auth
    await updateProfile(user, { displayName });

    // Create Firestore profile record with role: 'student' (Never 'admin')
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      displayName: displayName,
      role: 'student', // Forced student role
      studentIdNumber: studentIdNumber || '',
      department: department || '',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    return userProfile;
  } catch (err: any) {
    throw new Error(formatAuthError(err));
  }
}

/**
 * Login user (Student or Admin).
 * Checks the user profile document in Firestore to verify role.
 * If expectedRole is 'admin' and account is not admin, access is denied and session signed out.
 */
export async function loginUser(
  email: string,
  pass: string,
  expectedRole?: 'student' | 'admin'
): Promise<UserProfile> {
  if (!isFirebaseConfigured) {
    if (expectedRole === 'admin') {
      if (!email.toLowerCase().includes('admin')) {
        throw new Error(
          'Access Denied: This demo account does not have administrator privileges. Use admin@campus.edu or click the Admin Demo button.'
        );
      }
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(DEMO_ADMIN));
      return DEMO_ADMIN;
    }
    const studentUser = { ...DEMO_STUDENT, email };
    localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(studentUser));
    return studentUser;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Fetch Firestore user doc
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);

    let profile: UserProfile;

    if (userSnap.exists()) {
      profile = userSnap.data() as UserProfile;
    } else {
      // Fallback if profile doc is missing: default to student for safety
      profile = {
        uid: user.uid,
        email: user.email || email,
        displayName: user.displayName || 'Student User',
        role: 'student',
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, profile);
    }

    // STRICT ADMIN VERIFICATION:
    // If signing in via Administrator Portal, verify verified Firestore role is 'admin'
    if (expectedRole === 'admin' && profile.role !== 'admin') {
      // Sign out immediately so unprivileged user does not retain session
      await signOut(auth);
      throw new Error(
        'Access Denied: This account does not have administrator privileges. Only authorized grievance cell administrators can access the Administration Portal.'
      );
    }

    return profile;
  } catch (err: any) {
    if (err.message && err.message.startsWith('Access Denied:')) {
      throw err;
    }
    throw new Error(formatAuthError(err));
  }
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  if (!isFirebaseConfigured) {
    localStorage.removeItem(MOCK_USER_STORAGE_KEY);
    return;
  }
  await signOut(auth);
}

/**
 * Fetch profile by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured) {
    const raw = localStorage.getItem(MOCK_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  const userDocRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userDocRef);
  return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
}

/**
 * Get current stored demo user
 */
export function getStoredDemoUser(): UserProfile | null {
  const raw = localStorage.getItem(MOCK_USER_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}
