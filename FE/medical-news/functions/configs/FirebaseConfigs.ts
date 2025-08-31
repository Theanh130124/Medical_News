import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json";



// Khởi tạo Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});

const db = admin.firestore();

export { db, admin };
