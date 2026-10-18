import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import type { Complaint, ComplaintCategory, ComplaintStatus } from '../types';

const MOCK_COMPLAINTS_STORAGE_KEY = 'complaint_system_mock_complaints';

// Initial demo complaints for previewing features
const INITIAL_DEMO_COMPLAINTS: Complaint[] = [
  {
    id: 'comp-101',
    title: 'Water dispenser on 2nd Floor Library not functioning',
    description: 'The RO drinking water machine on the 2nd floor library wing has been leaking and not dispensing cold water since Monday.',
    category: 'Library',
    status: 'In Progress',
    studentId: 'demo-student-uid',
    studentName: 'Rahul Sharma',
    studentEmail: 'student@campus.edu',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    adminRemarks: 'Maintenance technician assigned to replace filter valve.',
  },
  {
    id: 'comp-102',
    title: 'Wi-Fi connection drop in Hostel Block B',
    description: 'Network connectivity disconnects intermittently between 8 PM and 11 PM every night, affecting online assignment submissions.',
    category: 'Hostel',
    status: 'Pending',
    studentId: 'demo-student-uid',
    studentName: 'Rahul Sharma',
    studentEmail: 'student@campus.edu',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'comp-103',
    title: 'Lab Projector bulb burnt in Seminar Hall 3',
    description: 'During morning lectures, the overhead digital projector shuts down after 5 minutes due to lamp overheating.',
    category: 'Infrastructure',
    status: 'Resolved',
    studentId: 'student_other_01',
    studentName: 'Ananya Varma',
    studentEmail: 'ananya@campus.edu',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    resolvedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    adminRemarks: 'Replaced projection lamp unit with new 4500-lumen module. Tested and operational.',
  },
];

function getStoredMockComplaints(): Complaint[] {
  const raw = localStorage.getItem(MOCK_COMPLAINTS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(MOCK_COMPLAINTS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_COMPLAINTS));
    return INITIAL_DEMO_COMPLAINTS;
  }
  return JSON.parse(raw);
}

function saveStoredMockComplaints(complaints: Complaint[]) {
  localStorage.setItem(MOCK_COMPLAINTS_STORAGE_KEY, JSON.stringify(complaints));
}

/**
 * Submit a new student complaint.
 * Automatically enforces status: 'Pending' and submission timestamp.
 */
export async function submitComplaint(data: {
  title: string;
  description: string;
  category: ComplaintCategory;
  studentId: string;
  studentName: string;
  studentEmail: string;
}): Promise<Complaint> {
  const now = new Date().toISOString();

  if (!isFirebaseConfigured) {
    const complaints = getStoredMockComplaints();
    const newComplaint: Complaint = {
      id: 'comp-' + Math.floor(1000 + Math.random() * 9000),
      title: data.title,
      description: data.description,
      category: data.category,
      status: 'Pending',
      studentId: data.studentId,
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      createdAt: now,
    };
    complaints.unshift(newComplaint);
    saveStoredMockComplaints(complaints);
    return newComplaint;
  }

  const complaintsRef = collection(db, 'complaints');
  const payload = {
    title: data.title,
    description: data.description,
    category: data.category,
    status: 'Pending' as ComplaintStatus,
    studentId: data.studentId,
    studentName: data.studentName,
    studentEmail: data.studentEmail,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(complaintsRef, payload);
  return {
    id: docRef.id,
    ...payload,
  };
}

/**
 * Fetch complaints submitted by a specific student (Student View).
 * Strict isolation: students only see their own complaints.
 */
export async function getStudentComplaints(studentId: string): Promise<Complaint[]> {
  if (!isFirebaseConfigured) {
    const all = getStoredMockComplaints();
    return all.filter((c) => c.studentId === studentId);
  }

  const complaintsRef = collection(db, 'complaints');
  const q = query(
    complaintsRef,
    where('studentId', '==', studentId)
  );

  const snapshot = await getDocs(q);
  const results: Complaint[] = [];
  snapshot.forEach((docSnap) => {
    results.push({ id: docSnap.id, ...(docSnap.data() as Omit<Complaint, 'id'>) });
  });

  // Sort client-side by date descending
  return results.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Fetch all complaints across campus (Admin View).
 */
export async function getAllComplaints(): Promise<Complaint[]> {
  if (!isFirebaseConfigured) {
    const all = getStoredMockComplaints();
    return [...all].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const complaintsRef = collection(db, 'complaints');
  const snapshot = await getDocs(complaintsRef);
  const results: Complaint[] = [];
  snapshot.forEach((docSnap) => {
    results.push({ id: docSnap.id, ...(docSnap.data() as Omit<Complaint, 'id'>) });
  });

  return results.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Update complaint status & admin remarks (Admin Only).
 */
export async function updateComplaintStatus(
  complaintId: string,
  status: ComplaintStatus,
  adminRemarks?: string
): Promise<void> {
  const now = new Date().toISOString();

  if (!isFirebaseConfigured) {
    const complaints = getStoredMockComplaints();
    const idx = complaints.findIndex((c) => c.id === complaintId);
    if (idx !== -1) {
      complaints[idx].status = status;
      complaints[idx].updatedAt = now;
      if (adminRemarks !== undefined) {
        complaints[idx].adminRemarks = adminRemarks;
      }
      if (status === 'Resolved') {
        complaints[idx].resolvedAt = now;
      }
      saveStoredMockComplaints(complaints);
    }
    return;
  }

  const docRef = doc(db, 'complaints', complaintId);
  const updateData: Record<string, any> = {
    status,
    updatedAt: now,
  };
  if (adminRemarks !== undefined) {
    updateData.adminRemarks = adminRemarks;
  }
  if (status === 'Resolved') {
    updateData.resolvedAt = now;
  }

  await updateDoc(docRef, updateData);
}

/**
 * Delete a complaint (Admin only)
 */
export async function deleteComplaint(complaintId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    const complaints = getStoredMockComplaints();
    const filtered = complaints.filter((c) => c.id !== complaintId);
    saveStoredMockComplaints(filtered);
    return;
  }
  const docRef = doc(db, 'complaints', complaintId);
  await deleteDoc(docRef);
}
