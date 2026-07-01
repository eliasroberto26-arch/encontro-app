const functions = require('firebase-functions');
const admin = require('firebase-admin');
const vision = require('@google-cloud/vision');
admin.initializeApp();
const client = new vision.ImageAnnotatorClient();

exports.moderateImage = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  const fileBucket = object.bucket;

  // 1. Ignora se não for imagem
  if (!object.contentType ||!object.contentType.startsWith('image/')) {
    console.log('Não é imagem. Ignorando.');
    return null;
  }
  
  // 2. Só roda pra fotos de perfil
  if (!filePath.startsWith('fotos_perfil/')) {
    console.log('Não é foto de perfil, ignorando.');
    return null;
  }

  const gcsUri = `gs://${fileBucket}/${filePath}`;
  const [result] = await client.safeSearchDetection(gcsUri);
  const detections = result.safeSearchAnnotation;

  if (detections.adult === 'LIKELY' || detections.adult === 'VERY_LIKELY') {
    const uid = filePath.split('/')[1];
    await admin.firestore().collection('users').doc(uid).update({
      fotoBloqueada: true,
      motivoBloqueio: 'Conteúdo adulto detectado pela IA',
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
    });
    await admin.storage().bucket(fileBucket).file(filePath).delete();
    console.log(`Foto bloqueada: ${filePath}`);
  }
  
  return null;
});

exports.bloqueioPorDenuncia = functions.firestore
.document('denuncias/{denunciaId}')
.onCreate(async (snap) => {
    const { denunciadoUid } = snap.data();
    const denunciasSnapshot = await admin.firestore()
    .collection('denuncias')
    .where('denunciadoUid', '==', denunciadoUid)
    .get();
    
    if (denunciasSnapshot.size >= 5) {
      await admin.firestore().collection('users').doc(denunciadoUid).update({
        banido: true,
        motivoBan: 'Múltiplas denúncias'
      });
      await admin.auth().updateUser(denunciadoUid, { disabled: true });
      console.log(`Usuário ${denunciadoUid} banido.`);
    }
    return null;
  });
