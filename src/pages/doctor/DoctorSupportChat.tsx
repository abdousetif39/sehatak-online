import { useState, useEffect, useRef } from 'react';
import { collection, writeBatch,  query, where, orderBy, getDocs, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { COLLECTIONS } from '../../lib/constants';
import { SupportConversation, SupportMessage } from '../../types';
import { Send, MessageCircle, Loader2, CheckCheck, Check, Trash2 } from 'lucide-react';
import DeleteMessageModal from '../../components/DeleteMessageModal';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

export default function DoctorSupportChat() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<SupportMessage | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, COLLECTIONS.SUPPORT_CONVERSATIONS),
      where('doctorId', '==', user.id)
  );
    const unsubscribe = onSnapshot(q, async (snap) => {
      if (!snap.empty) {
        const convId = snap.docs[0].id;
        setConversationId(convId);
        if (snap.docs[0].data().unreadForDoctor) {
          try {
            await updateDoc(doc(db, COLLECTIONS.SUPPORT_CONVERSATIONS, convId), {
              unreadForDoctor: false
            });
          } catch (e) {}
        }
      } else {
        setConversationId(null);
      }
      setLoading(false);
    }, (error) => { console.error("Firestore onSnapshot error:", error.message || error); });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!conversationId) return;

    const q = query(
      collection(db, `${COLLECTIONS.SUPPORT_CONVERSATIONS}/${conversationId}/messages`),
      orderBy('createdAt', 'asc')
  );

    const unsubscribe = onSnapshot(q, async (snap) => {
      const newMsgs = snap.docs.map(d => ({ ...d.data(), id: d.id } as SupportMessage));
      setMessages(newMsgs);
      scrollToBottom();
      
      // Mark conversation as read for doctor if there are new messages
      if (snap.docs.length > 0) {
         try {
           const convRef = doc(db, COLLECTIONS.SUPPORT_CONVERSATIONS, conversationId);
           const convSnap = await getDoc(convRef);
           if (convSnap.exists() && convSnap.data().unreadForDoctor) {
             await updateDoc(convRef, { unreadForDoctor: false });
           }
           
           const batch = writeBatch(db);
           let hasUpdates = false;

           // 1. Update individual messages from admin that are unread
           const unreadAdminMsgs = newMsgs.filter(m => m.senderId === 'admin' && !m.readAt);
           for (const msg of unreadAdminMsgs) {
             const msgRef = doc(db, `${COLLECTIONS.SUPPORT_CONVERSATIONS}/${conversationId}/messages`, msg.id);
             batch.update(msgRef, { readAt: serverTimestamp() });
             hasUpdates = true;
           }
           
           if (hasUpdates) {
             await batch.commit();
           }

           // 2. Check for broadcast messages to mark as read in tracking collection
           const broadcastsToMark = unreadAdminMsgs.filter(m => m.broadcastId);
           if (broadcastsToMark.length > 0) {
             const bBatch = writeBatch(db);
             let hasBUpdates = false;
             for (const msg of broadcastsToMark) {
               const recipientRef = doc(db, COLLECTIONS.BROADCAST_RECIPIENTS, `${msg.broadcastId}_${user?.id}`);
               const rSnap = await getDoc(recipientRef);
               if (rSnap.exists() && !rSnap.data().readAt) {
                 bBatch.update(recipientRef, { readAt: serverTimestamp() });
                 hasBUpdates = true;
               }
             }
             if (hasBUpdates) await bBatch.commit();
           }
         } catch (e) {
           console.error("Error updating read status:", e);
         }
      }
    }, (error) => { console.error("Firestore onSnapshot error:", error.message || error); });

    return () => unsubscribe();
  }, [conversationId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      let currentConvId = conversationId;
      
      if (!currentConvId) {
        // Create conversation
        const newConvRef = await addDoc(collection(db, COLLECTIONS.SUPPORT_CONVERSATIONS), {
          doctorId: user.id,
          lastMessage: newMessage.trim(),
          lastMessageAt: new Date().toISOString(),
          unreadForAdmin: true,
          unreadForDoctor: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        currentConvId = newConvRef.id;
        setConversationId(currentConvId);
      } else {
        // Update conversation
        await updateDoc(doc(db, COLLECTIONS.SUPPORT_CONVERSATIONS, currentConvId), {
          lastMessage: newMessage.trim(),
          lastMessageAt: new Date().toISOString(),
          unreadForAdmin: true,
          updatedAt: new Date().toISOString()
        });
      }

      // Add message
      await addDoc(collection(db, `${COLLECTIONS.SUPPORT_CONVERSATIONS}/${currentConvId}/messages`), {
        conversationId: currentConvId,
        senderId: user.id,
        senderRole: 'doctor',
        text: newMessage.trim(),
        createdAt: new Date().toISOString(),
        readAt: null
      });

      // Mark repliedAt if this is replying to a broadcast
      const lastBroadcast = messages.slice().reverse().find(m => m.broadcastId && m.senderId === 'admin');
      if (lastBroadcast) {
        try {
          const recipientRef = doc(db, COLLECTIONS.BROADCAST_RECIPIENTS, `${lastBroadcast.broadcastId}_${user.id}`);
          const rSnap = await getDoc(recipientRef);
          if (rSnap.exists() && !rSnap.data().repliedAt) {
            await updateDoc(recipientRef, { repliedAt: serverTimestamp() });
          }
        } catch (e) {
          console.error('Error updating replied status:', e);
        }
      }

      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteForMe = async () => {
    if (!messageToDelete) return;
    try {
      await updateDoc(doc(db, `${COLLECTIONS.SUPPORT_CONVERSATIONS}/${conversationId}/messages`, messageToDelete.id), {
        deletedForDoctor: true
      });
      setMessageToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteForEveryone = async () => {
    if (!messageToDelete) return;
    try {
      await updateDoc(doc(db, `${COLLECTIONS.SUPPORT_CONVERSATIONS}/${conversationId}/messages`, messageToDelete.id), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: user?.id || 'unknown'
      });
      setMessageToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
  }

  return (
    <>
      <DeleteMessageModal isOpen={!!messageToDelete} onClose={() => setMessageToDelete(null)} onDeleteForMe={handleDeleteForMe} onDeleteForEveryone={handleDeleteForEveryone} isMe={messageToDelete?.senderRole === "doctor"} />
    <div className="flex flex-col h-[calc(100vh-130px)] md:h-[calc(100vh-160px)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-slate-900">{t('doctor_support')}</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{t('contact_admin_desc')}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <p>{t('no_messages_yet')}</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            if (msg.deletedForDoctor) return null;
            const isMe = msg.senderRole === 'doctor';
            return (
              <div key={msg.id || index} className={`flex group ${isMe ? 'justify-end' : 'justify-start'}`}>
                {isMe && !msg.isDeleted && (
                  <button
                    onClick={() => setMessageToDelete(msg)}
                    className="opacity-100 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all self-center mr-2 rtl:ml-2 rtl:mr-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className={`max-w-[80%] md:max-w-[60%] rounded-2xl px-5 py-3 ${isMe ? 'bg-blue-600 text-white rounded-br-sm ltr:rounded-br-sm rtl:rounded-bl-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm ltr:rounded-bl-sm rtl:rounded-br-sm shadow-sm'}`}>
                  {msg.isDeleted ? (
                    <div className={`flex items-center gap-2 italic text-sm ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                      <Trash2 className="w-4 h-4" />
                      {t('message_has_been_deleted')}
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                      <div className={`text-[10px] mt-2 ${isMe ? 'text-blue-100' : 'text-slate-400'} flex items-center justify-end gap-1.5`}>
                        <span>{format(new Date(msg.createdAt), 'HH:mm')}</span>
                        {isMe && (
                          <span className="flex items-center gap-0.5">
                            {msg.readAt ? (
                              <><CheckCheck className="w-3.5 h-3.5 text-blue-200" /> <span>{t('message_read')}</span></>
                            ) : msg.deliveredAt ? (
                              <><CheckCheck className="w-3.5 h-3.5 text-white/70" /> <span>{t('message_delivered')}</span></>
                            ) : (
                              <><Check className="w-3.5 h-3.5 text-white/50" /> <span>{t('message_sent')}</span></>
                            )}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {!isMe && !msg.isDeleted && (
                  <button
                    onClick={() => setMessageToDelete(msg)}
                    className="opacity-100 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all self-center ml-2 rtl:mr-2 rtl:ml-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );

                      })
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('type_message')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none resize-none min-h-[50px] max-h-[150px]"
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 shrink-0 mb-[2px]"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rtl:-scale-x-100" />}
          </button>
        </form>
      </div>
    </div>
      </>
  );
}
