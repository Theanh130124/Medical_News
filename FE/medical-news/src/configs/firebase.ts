import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPLqQJ5zYHHcB0gKRPI_BCuhDQ7pSn6bo",
  authDomain: "healthapp-a5a6d.firebaseapp.com",
  projectId: "healthapp-a5a6d",
  storageBucket: "healthapp-a5a6d.firebasestorage.app",
  messagingSenderId: "103302228290",
  appId: "1:103302228290:web:2da602462140612a6c00db",
  measurementId: "G-DJTKFWQHYV"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Lấy instance của Firestore
const db = getFirestore(app);

// Export tất cả các hàm cần thiết
export { 
  db, 
  app,
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  Timestamp
};

// Export các types để sử dụng trong TypeScript
export type { DocumentData, QuerySnapshot, DocumentSnapshot };

export default app;