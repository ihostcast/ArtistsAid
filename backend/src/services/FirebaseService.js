const admin = require('firebase-admin');
const config = require('../config/constants.json');

class FirebaseService {
    constructor() {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                }),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
        }

        this.messaging = admin.messaging();
        this.storage = admin.storage();
        this.db = admin.firestore();
    }

    // Notificaciones Push
    async sendPushNotification(tokens, notification, data = {}) {
        try {
            const message = {
                notification,
                data,
                tokens: Array.isArray(tokens) ? tokens : [tokens]
            };

            const response = await this.messaging.sendMulticast(message);
            
            return {
                success: true,
                results: response.responses,
                successCount: response.successCount,
                failureCount: response.failureCount
            };
        } catch (error) {
            console.error('Push notification error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Almacenamiento de archivos
    async uploadFile(file, path) {
        try {
            const bucket = this.storage.bucket();
            const blob = bucket.file(path);
            
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: file.mimetype
                }
            });

            return new Promise((resolve, reject) => {
                blobStream.on('error', (error) => {
                    reject({
                        success: false,
                        error: error.message
                    });
                });

                blobStream.on('finish', async () => {
                    // Hacer el archivo público
                    await blob.makePublic();
                    
                    resolve({
                        success: true,
                        url: `https://storage.googleapis.com/${bucket.name}/${blob.name}`
                    });
                });

                blobStream.end(file.buffer);
            });
        } catch (error) {
            console.error('File upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Eliminar archivo
    async deleteFile(path) {
        try {
            const bucket = this.storage.bucket();
            await bucket.file(path).delete();

            return {
                success: true,
                message: 'File deleted successfully'
            };
        } catch (error) {
            console.error('File deletion error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Base de datos en tiempo real
    async saveRealtimeData(collection, document, data) {
        try {
            await this.db.collection(collection).doc(document).set(data, { merge: true });
            
            return {
                success: true,
                message: 'Data saved successfully'
            };
        } catch (error) {
            console.error('Realtime database error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Obtener datos en tiempo real
    async getRealtimeData(collection, document) {
        try {
            const doc = await this.db.collection(collection).doc(document).get();
            
            if (!doc.exists) {
                return {
                    success: false,
                    error: 'Document not found'
                };
            }

            return {
                success: true,
                data: doc.data()
            };
        } catch (error) {
            console.error('Realtime database error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Escuchar cambios en tiempo real
    listenToChanges(collection, document, callback) {
        return this.db.collection(collection).doc(document)
            .onSnapshot(
                (doc) => {
                    if (doc.exists) {
                        callback({
                            success: true,
                            data: doc.data()
                        });
                    } else {
                        callback({
                            success: false,
                            error: 'Document not found'
                        });
                    }
                },
                (error) => {
                    console.error('Realtime listener error:', error);
                    callback({
                        success: false,
                        error: error.message
                    });
                }
            );
    }

    // Autenticación de usuario
    async verifyIdToken(idToken) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            return {
                success: true,
                user: decodedToken
            };
        } catch (error) {
            console.error('Token verification error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Crear usuario en Firebase
    async createFirebaseUser(email, password) {
        try {
            const user = await admin.auth().createUser({
                email,
                password,
                emailVerified: false
            });

            return {
                success: true,
                user
            };
        } catch (error) {
            console.error('User creation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new FirebaseService();
