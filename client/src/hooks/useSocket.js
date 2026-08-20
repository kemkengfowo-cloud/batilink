import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || '';

let socketInstance = null;

export const useSocket = (token, onNotification) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketInstance = socketRef.current;

    socketRef.current.on('connect', () => {
      console.log('Socket connecte');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket deconnecte');
    });

    // Nouveau message
    socketRef.current.on('nouveau_message', (data) => {
      if (onNotification) onNotification({
        type: 'message',
        titre: 'Nouveau message',
        texte: data.contenu?.substring(0, 50) + '...',
        lien: '/messages',
        data
      });
    });

    // Nouveau devis
    socketRef.current.on('nouveau_devis', (data) => {
      if (onNotification) onNotification({
        type: 'devis',
        titre: 'Nouveau devis recu',
        texte: `Devis : ${data.titre} — ${new Intl.NumberFormat('fr-FR').format(data.total)} FCFA`,
        lien: '/devis',
        data
      });
    });

    // Devis accepte
    socketRef.current.on('devis_accepte', (data) => {
      if (onNotification) onNotification({
        type: 'success',
        titre: 'Devis accepte',
        texte: 'Votre devis a ete accepte par le client',
        lien: `/devis/${data.devisId}`,
        data
      });
    });

    // Nouveau projet
    socketRef.current.on('nouveau_projet', (data) => {
      if (onNotification) onNotification({
        type: 'projet',
        titre: 'Nouveau projet disponible',
        texte: data.titre,
        lien: `/projects/${data.projetId}`,
        data
      });
    });

    // Jalon validé
    socketRef.current.on('jalon_valide', (data) => {
      if (onNotification) onNotification({
        type: 'success',
        titre: 'Jalon valide',
        texte: 'Un jalon a ete valide par le client',
        lien: `/devis/${data.devisId}`,
        data
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketInstance = null;
      }
    };
  }, [token]);

  return socketRef.current;
};

export const getSocket = () => socketInstance;
