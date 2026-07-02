const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.onNewMessage = functions.firestore
 .document('chats/{chatId}/messages/{messageId}')
 .onCreate(async (snap, context) => {
    const message = snap.data();
    const chatId = context.params.chatId;
    
    const lastMsg = await db.collection(`chats/${chatId}/messages`)
     .where('senderId', '!=', message.senderId)
     .orderBy('createdAt', 'desc')
     .limit(1)
     .get();
    
    if (!lastMsg.empty) {
      const diffMinutes = (message.createdAt.toDate() - lastMsg.docs[0].data().createdAt.toDate()) / 60000;
      
      if (diffMinutes < 60) {
        const userRef = db.collection('users').doc(message.senderId);
        const user = await userRef.get();
        const currentAvg = user.data().avgResponseTime || 60;
        const newAvg = (currentAvg + diffMinutes) / 2;
        const plan = user.data().plan || 'gratis';
        
        await userRef.update({ 
          avgResponseTime: newAvg,
          fastResponder: newAvg < 60 && plan!== 'gratis'
        });
      }
    }
  });

// Função: Limite de 10 curtidas + Chat travado
exports.checkCanLike = functions.https.onCall(async (data, context) => {
  const uid = context.auth.uid;
  const user = await db.collection('users').doc(uid).get();
  const plan = user.data().plan || 'gratis';
  
  if (plan === 'gratis') {
    const today = new Date().toISOString().split('T')[0];
    const likesToday = await db.collection('likes')
     .where('userId', '==', uid)
     .where('date', '==', today)
     .get();
      
    if (likesToday.size >= 10) {
      throw new functions.https.HttpsError('resource-exhausted', 'Limite de 10 curtidas atingido');
    }
    return { canLike: true, remaining: 10 - likesToday.size };
  }
  
  return { canLike: true, remaining: 999 };
});

exports.checkCanStartChat = functions.https.onCall(async (data, context) => {
  const { matchId, otherUserId } = data;
  const uid = context.auth.uid;
  const user = await db.collection('users').doc(uid).get();
  
  if (user.data().plan === 'gratis') {
    const messages = await db.collection(`chats/${matchId}/messages`)
     .where('senderId', '==', otherUserId)
     .limit(1)
     .get();
      
    if (messages.empty) {
      throw new functions.https.HttpsError('permission-denied', 'Aguardando ela iniciar a conversa');
    }
  }
  
  return { canChat: true };
});
