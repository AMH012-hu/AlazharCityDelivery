import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';
import { getFirestore, collection, addDoc, doc, setDoc, updateDoc, onSnapshot, query, where, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

const app = initializeApp({ apiKey:'AIzaSyB1byxcijqYpzdRhoZETKmMGiTPq_y1uS4', authDomain:'alazhar-city-delivery.firebaseapp.com', projectId:'alazhar-city-delivery', storageBucket:'alazhar-city-delivery.firebasestorage.app', messagingSenderId:'604870856587', appId:'1:604870856587:web:f5af0a344ab4568e04e98e' });
const auth = getAuth(app), db = getFirestore(app), provider = new GoogleAuthProvider();
let currentUser = null, stopOrders = null;

async function signIn() {
  const result = await signInWithPopup(auth, provider); currentUser = result.user;
  if (currentUser.email !== 'ammarhalawa760@gmail.com') await setDoc(doc(db,'users',currentUser.uid), { role:'customer', name:currentUser.displayName||'', email:currentUser.email||'', updatedAt:serverTimestamp() }, {merge:true});
  return currentUser;
}
async function createOrder(input) {
  if (!currentUser) throw new Error('SIGN_IN_REQUIRED');
  const ref = await addDoc(collection(db,'orders'), { ...input, reference:'AZ-'+Date.now().toString().slice(-6), customerId:currentUser.uid, customerEmail:currentUser.email||'', status:'new', riderId:null, storeOwnerId:null, createdAt:serverTimestamp(), updatedAt:serverTimestamp() });
  return {id:ref.id};
}
function watchOrders(callback) {
  if (stopOrders) stopOrders(); if (!currentUser) return () => {};
  const source = currentUser.email === 'ammarhalawa760@gmail.com' ? collection(db,'orders') : query(collection(db,'orders'),where('customerId','==',currentUser.uid));
  stopOrders = onSnapshot(source, snap => callback(snap.docs.map(d => ({id:d.id,...d.data(),createdAt:d.data().createdAt?.toDate?.()?.toISOString()||new Date().toISOString()}))), error => console.warn('Firestore orders:',error.code));
  return () => { if (stopOrders) stopOrders(); };
}
async function updateOrder(id,patch){ await updateDoc(doc(db,'orders',id), {...patch,updatedAt:serverTimestamp()}); }
window.ACDCloud={signIn,signOut:()=>signOut(auth),user:()=>currentUser,createOrder,updateOrder,watchOrders,isAdmin:()=>currentUser?.email==='ammarhalawa760@gmail.com'};
onAuthStateChanged(auth,user=>{currentUser=user;window.dispatchEvent(new Event('acd-auth-change'));});
window.dispatchEvent(new Event('acd-cloud-ready'));
