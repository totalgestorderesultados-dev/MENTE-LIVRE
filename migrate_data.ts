import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function migrate() {
  console.log('Migrating data in:', firebaseConfig.firestoreDatabaseId);
  
  const conts = await getDocs(collection(db, 'contents'));
  let updatedCount = 0;
  
  for (const d of conts.docs) {
    const data = d.data();
    if (!data.accessLevel) {
      console.log('Updating content:', d.id);
      await updateDoc(doc(db, 'contents', d.id), {
        accessLevel: 'public'
      });
      updatedCount++;
    }
  }
  
  console.log('Migration complete. Updated:', updatedCount);
}

migrate().catch(console.error);
