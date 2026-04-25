import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  console.log('Using database:', firebaseConfig.firestoreDatabaseId);
  try {
    const cats = await getDocs(collection(db, 'categories'));
    console.log('Categories count:', cats.size);
    cats.forEach(doc => console.log('Cat:', doc.id, doc.data()));

    const conts = await getDocs(collection(db, 'contents'));
    console.log('Contents count:', conts.size);
    conts.forEach(doc => console.log('Cont:', doc.id, doc.data()));
  } catch (e) {
    console.error('Error during check:', e);
  }
}

check().catch(console.error);
