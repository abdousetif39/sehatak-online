import { useState, useEffect, useRef } from 'react';
import { collection, serverTimestamp, query, orderBy, onSnapshot, getDocs, where, doc, updateDoc, addDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { COLLECTIONS } from '../../lib/constants';
import { SupportConversation, SupportMessage, Doctor, BroadcastMessage } from '../../types';
import { Search, MessageCircle, Send, Loader2, User, Check, CheckCheck, Megaphone, Users, CheckSquare, Square, X, History, Filter, Trash2 } from 'lucide-react';
import DeleteMessageModal from '../../components/DeleteMessageModal';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import MessageModal from '../../components/MessageModal';

export default function AdminSupportChat() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'doctors' | 'broadcasts'>('doctors');
  
  // Data
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [broadcastStats, setBroadcastStats] = useState<Record<string, { read: number, replied: number, delivered: number, sentOnly: number, unread: number, recipients: any[] }>>({});
  const [messageToDelete, setMessageToDelete] = useState<SupportMessage | null>(null);
  
  const [selectedDoctorIdForChat, setSelectedDoctorIdForChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  
  const selectedDoctorForChat = doctors.find(d => d.id === selectedDoctorIdForChat) || null;
  const selectedConv = conversations.find(c => c.doctorId === selectedDoctorIdForChat) || null;
  
  // Selection & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<Set<string>>(new Set());
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isRtl = i18n.language === 'ar';

  // Broadcast Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [sendingProgress, setSendingProgress] = useState<{current: number, total: number} | null>(null);
  
  const [messageModal, setMessageModal] = useState({ open: false, type: 'info' as any, title: '', message: '' });

  // Broadcast Details State
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastMessage | null>(null);
  const [showDeleteBroadcastConfirm, setShowDeleteBroadcastConfirm] = useState(false);

  const handleDeleteBroadcast = async () => {
    if (!selectedBroadcast) return;
    try {
      await updateDoc(doc(db, COLLECTIONS.BROADCAST_MESSAGES, selectedBroadcast.id), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: user?.id || 'unknown'
      });
      setSelectedBroadcast(null);
      setShowDeleteBroadcastConfirm(false);
    } catch (e) {
      console.error('Error deleting broadcast', e);
      setMessageModal({ open: true, type: 'error', title: t('error'), message: t('delete_failed') });
    }
  };


  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch Doctors
      const docsSnap = await getDocs(collection(db, COLLECTIONS.DOCTORS));
      const loadedDoctors = docsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Doctor));
      setDoctors(loadedDoctors);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Listen to conversations
    const q = query(collection(db, COLLECTIONS.SUPPORT_CONVERSATIONS));
    const unsub = onSnapshot(q, (snap) => {
      const convs = snap.docs.map(d => ({ ...d.data(), id: d.id } as SupportConversation));
      setConversations(convs.sort((a, b) => {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return timeB - timeA;
      }));
    }, (error) => { console.error("Firestore onSnapshot error:", error); });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Listen to broadcasts
    const q = query(collection(db, COLLECTIONS.BROADCAST_MESSAGES), orderBy('sentAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setBroadcasts(snap.docs.map(d => ({ ...d.data(), id: d.id } as BroadcastMessage)).filter(b => !b.isDeleted));
    }, (error) => { console.error("Firestore onSnapshot error:", error.message || error); });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Listen to broadcast recipients
    const q = query(collection(db, COLLECTIONS.BROADCAST_RECIPIENTS));
    const unsub = onSnapshot(q, (snap) => {
      const stats: Record<string, { read: number, replied: number, delivered: number, sentOnly: number, unread: number, recipients: any[] }> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        if (!stats[data.broadcastId]) {
          stats[data.broadcastId] = { read: 0, replied: 0, delivered: 0, sentOnly: 0, unread: 0, recipients: [] };
        }
        if (data.readAt) {
          stats[data.broadcastId].read++;
        } else if (data.deliveredAt) {
          stats[data.broadcastId].delivered++;
          stats[data.broadcastId].unread++;
        } else {
          stats[data.broadcastId].sentOnly++;
          stats[data.broadcastId].unread++;
        }
        if (data.repliedAt) stats[data.broadcastId].replied++;
        stats[data.broadcastId].recipients.push({
          doctorId: data.doctorId,
          deliveredAt: data.deliveredAt,
          readAt: data.readAt,
          repliedAt: data.repliedAt
        });
      });
      setBroadcastStats(stats);
    }, (error) => { console.error("Firestore onSnapshot error:", error.message || error); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedConv?.id) {
      setMessages([]);
      return;
    }
    const q = query(
      collection(db, `${COLLECTIONS.SUPPORT_CONVERSATIONS}/${selectedConv.id}/messages`),
      orderBy('createdAt', 'asc')
  );
    const unsub = onSnapshot(q, async (snap) => {
      const newMsgs = snap.docs.map(d => ({ ...d.data(), id: d.id } as SupportMessage));
      setMessages(newMsgs);
      scrollToBottom();
      
      try {
        if (selectedConv.unreadForAdmin) {
          await updateDoc(doc(db, COLLECTIONS.SUPPORT_CONVERSATIONS, selectedConv.id), {
            unreadForAdmin: false
          });
        }
        
        // Update read status for individual messages from doctor
        const unreadDoctorMsgs = newMsgs.filter(m => m.senderId !== 'admin' && !m.readAt);
        if (unreadDoctorMsgs.length > 0) {
          const now = new Date().toISOString();
          const batch = writeBatch(db);
          for (const msg of unreadDoctorMsgs) {
            const msgRef = doc(db, `${COLLECTIONS.SUPPORT_CONVERSATIONS}/${selectedConv.id}/messages`, msg.id);
            batch.update(msgRef, { readAt: now });
          }
          await batch.commit();
        }
      } catch (e) {
        console.error("Error updating admin read status:", e);
      }
    }, (error) => { console.error("Firestore onSnapshot error:", error); });
    return () => unsub();
  }, [selectedConv?.id, selectedConv?.unreadForAdmin]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Filter Doctors
  const filteredDoctors = doctors.filter(doc => {
    const searchStr = searchTerm.toLowerCase();
    const fullName = `${doc.firstNameFr || doc.firstNameAr || ''} ${doc.lastNameFr || doc.lastNameAr || ''} ${doc.name || ''}`.toLowerCase();
    const specialty = `${doc.specialty || ''} ${doc.specialtyAr || ''} ${doc.specialtyFr || ''}`.toLowerCase();
    const location = `${doc.state || ''} ${doc.city || ''}`.toLowerCase();
    const status = doc.isActive ? t('status_active').toLowerCase() : t('status_inactive').toLowerCase();
    
    return fullName.includes(searchStr) || specialty.includes(searchStr) || location.includes(searchStr) || status.includes(searchStr);
  });

  const getDoctorName = (d: Doctor) => {
    return d.name || `${d.firstNameFr || d.firstNameAr} ${d.lastNameFr || d.lastNameAr}`;
  }

  // Merged List
  const doctorListItems = filteredDoctors.map(doctor => {
    const conv = conversations.find(c => c.doctorId === doctor.id);
    return { doctor, conv };
  }).sort((a, b) => {
    // Sort by unread first, then by latest message, then by name
    if (a.conv?.unreadForAdmin && !b.conv?.unreadForAdmin) return -1;
    if (!a.conv?.unreadForAdmin && b.conv?.unreadForAdmin) return 1;
    
    if (a.conv?.updatedAt && b.conv?.updatedAt) {
      return new Date(b.conv.updatedAt).getTime() - new Date(a.conv.updatedAt).getTime();
    }
    if (a.conv?.updatedAt) return -1;
    if (b.conv?.updatedAt) return 1;
    return getDoctorName(a.doctor).localeCompare(getDoctorName(b.doctor));
  });

  const handleSelectDoctor = (id: string) => {
    const newSet = new Set(selectedDoctorIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedDoctorIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedDoctorIds.size === filteredDoctors.length) {
      setSelectedDoctorIds(new Set());
    } else {
      setSelectedDoctorIds(new Set(filteredDoctors.map(d => d.id)));
    }
  };

  const openChat = async (doctor: Doctor) => {
    setSelectedDoctorIdForChat(doctor.id);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedDoctorForChat || sending) return;

    setSending(true);
    try {
      let currentConvId = selectedConv?.id;
      const now = new Date().toISOString();

      if (!currentConvId) {
        // Create conversation
        const newConvRef = await addDoc(collection(db, COLLECTIONS.SUPPORT_CONVERSATIONS), {
          doctorId: selectedDoctorForChat.id,
          lastMessage: newMessage.trim(),
          lastMessageAt: now,
          unreadForAdmin: false,
          unreadForDoctor: true,
          createdAt: now,
          updatedAt: now
        });
        currentConvId = newConvRef.id;
        // Don't need to manually set selectedConv, snapshot will catch it if we keep doctor selected
      } else {
        await updateDoc(doc(db, COLLECTIONS.SUPPORT_CONVERSATIONS, currentConvId), {
          lastMessage: newMessage.trim(),
          lastMessageAt: now,
          unreadForDoctor: true,
          updatedAt: now
        });
      }

      await addDoc(collection(db, `${COLLECTIONS.SUPPORT_CONVERSATIONS}/${currentConvId}/messages`), {
        conversationId: currentConvId,
        senderId: 'admin',
        senderRole: 'admin',
        text: newMessage.trim(),
        createdAt: now,
        readAt: null
      });

      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastText.trim() || selectedDoctorIds.size === 0 || !user) return;
    
    setSendingProgress({ current: 0, total: selectedDoctorIds.size });
    
    try {
      const now = new Date().toISOString();
      const adminId = user.id || 'admin';
      
      // 1. Create Broadcast Message Doc
      const broadcastRef = doc(collection(db, COLLECTIONS.BROADCAST_MESSAGES));
      const broadcastId = broadcastRef.id;
      
      const broadcastData: BroadcastMessage = {
        id: broadcastId,
        adminId,
        title: broadcastTitle.trim(),
        text: broadcastText.trim(),
        recipientCount: selectedDoctorIds.size,
        readCount: 0,
        replyCount: 0,
        sentAt: now
      };
      
      // 2. Process in chunks of 100 to stay well under 500 ops limit
      // (Each doctor needs 1-2 ops: update/create conv, add message, add recipient)
      const docIdsArray = Array.from(selectedDoctorIds);
      const CHUNK_SIZE = 100; 
      
      // Save the broadcast doc first
      // Let's use batch for the broadcast doc just to be safe
      const initialBatch = writeBatch(db);
      initialBatch.set(broadcastRef, broadcastData);
      await initialBatch.commit();

      let processedCount = 0;

      for (let i = 0; i < docIdsArray.length; i += CHUNK_SIZE) {
        const chunk = docIdsArray.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        
        for (const docId of chunk) {
          // Find if conv exists
          const existingConv = conversations.find(c => c.doctorId === docId);
          let convId = existingConv?.id;
          
          if (!convId) {
            const newConvRef = doc(collection(db, COLLECTIONS.SUPPORT_CONVERSATIONS));
            convId = newConvRef.id;
            batch.set(newConvRef, {
              doctorId: docId,
              lastMessage: broadcastTitle.trim(),
              lastMessageAt: now,
              unreadForAdmin: false,
              unreadForDoctor: true,
              createdAt: now,
              updatedAt: now
            });
          } else {
            batch.update(doc(db, COLLECTIONS.SUPPORT_CONVERSATIONS, convId), {
              lastMessage: broadcastTitle.trim(),
              lastMessageAt: now,
              unreadForDoctor: true,
              updatedAt: now
            });
          }
          
          // Add message
          const msgRef = doc(collection(db, `${COLLECTIONS.SUPPORT_CONVERSATIONS}/${convId}/messages`));
          batch.set(msgRef, {
            conversationId: convId,
            broadcastId: broadcastId,
            senderId: 'admin',
            senderRole: 'admin',
            text: `**${broadcastTitle.trim()}**\n\n${broadcastText.trim()}`,
            createdAt: now,
            readAt: null
          });
          
          // Add Recipient
          const recipientRef = doc(db, COLLECTIONS.BROADCAST_RECIPIENTS, `${broadcastId}_${docId}`);
          batch.set(recipientRef, {
            id: `${broadcastId}_${docId}`,
            broadcastId,
            doctorId: docId,
            deliveredAt: null,
            readAt: null,
            repliedAt: null
          });
        }
        
        await batch.commit();
        processedCount += chunk.length;
        setSendingProgress({ current: processedCount, total: selectedDoctorIds.size });
      }
      
      setShowBroadcastModal(false);
      setBroadcastTitle('');
      setBroadcastText('');
      setSelectedDoctorIds(new Set());
      
      setMessageModal({
        open: true,
        type: 'success',
        title: t('broadcast_sent_success'),
        message: ''
      });
      
    } catch (error) {
      console.error('Error sending broadcast:', error);
      setMessageModal({
        open: true,
        type: 'error',
        title: t('error'),
        message: String(error)
      });
    } finally {
      setSendingProgress(null);
    }
  };
  const handleDeleteForMe = async () => {
    if (!messageToDelete) return;
    try {
      const msgRef = doc(db, `${COLLECTIONS.SUPPORT_CONVERSATIONS}/${selectedConv?.id}/messages`, messageToDelete.id);
      await updateDoc(msgRef, { deletedForAdmin: true });
      setMessageToDelete(null);
    } catch (error) {
      console.error("Error deleting message for me:", error);
    }
  };

  const handleDeleteForEveryone = async () => {
    if (!messageToDelete) return;
    try {
      const msgRef = doc(db, `${COLLECTIONS.SUPPORT_CONVERSATIONS}/${selectedConv?.id}/messages`, messageToDelete.id);
      await updateDoc(msgRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: user?.id || 'unknown',
      });
      setMessageToDelete(null);
    } catch (error) {
      console.error("Error deleting message for everyone:", error);
    }
  };

  return (
    <>
      <DeleteMessageModal isOpen={!!messageToDelete} onClose={() => setMessageToDelete(null)} onDeleteForMe={handleDeleteForMe} onDeleteForEveryone={handleDeleteForEveryone} isMe={messageToDelete?.senderRole === "admin"} />
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-50 rounded-2xl overflow-hidden shadow-sm">
      
      {/* Top Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex gap-4 shrink-0">
        <button 
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${activeTab === 'doctors' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {t('tab_doctors')}
        </button>
        <button 
          onClick={() => setActiveTab('broadcasts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${activeTab === 'broadcasts' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {t('tab_broadcasts')}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'doctors' && (
          <>
            {/* Left/Right Panel: Doctors List */}
            <div className={`w-full md:w-[350px] flex flex-col bg-white border-r border-slate-200 rtl:border-r-0 rtl:border-l ${selectedDoctorForChat ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 border-b border-slate-200">
                <div className="relative mb-3">
                  <input name="searchterm" id="searchterm"
                    type="text"
                    placeholder={t('search_doctor')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 rtl:pr-9 rtl:pl-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                   autoComplete="off" />
                </div>
                
                <div className="flex items-center justify-between">
                  <button 
                    onClick={handleSelectAll}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {selectedDoctorIds.size === filteredDoctors.length && filteredDoctors.length > 0 ? (
                      <>
                        <CheckSquare className="w-4 h-4" />
                        {t('deselect_all')}
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4" />
                        {t('select_all')}
                      </>
                    )}
                  </button>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-medium">
                    {t('selected_count').replace('{{count}}', selectedDoctorIds.size.toString())}
                  </span>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => {
                      setSelectedDoctorIds(new Set(doctors.map(d => d.id)));
                      setShowBroadcastModal(true);
                    }}
                    className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    {t('send_to_all')}
                  </button>

                  {selectedDoctorIds.size > 0 && selectedDoctorIds.size !== doctors.length && (
                    <button 
                      onClick={() => setShowBroadcastModal(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      {t('send_to_selected')}
                    </button>
        )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {loading ? (
  <div className="p-8 flex justify-center">
    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
  </div>
) : doctorListItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    {t('no_messages_yet')}
                  </div>
                ) : (
                  doctorListItems.map(({ doctor, conv }) => (
                    <div key={doctor.id} className={`flex items-stretch hover:bg-slate-50 transition-colors ${selectedDoctorForChat?.id === doctor.id ? 'bg-blue-50/50' : ''}`}>
                      <div className="flex items-center justify-center px-4 cursor-pointer" onClick={() => handleSelectDoctor(doctor.id)}>
                        {selectedDoctorIds.has(doctor.id) ? (
                            <>
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            </>
                          ) : (
                            <>
                              <Square className="w-5 h-5 text-slate-300" />
                            </>
                          )}
                      </div>
                      
                      <button
                        onClick={() => openChat(doctor)}
                        className="flex-1 p-4 pl-0 rtl:pl-4 rtl:pr-0 flex items-start gap-3 text-start min-w-0"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                            {doctor.photoUrl ? (
                                <img src={doctor.photoUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-slate-400" />
                              )}
                          </div>
                          {conv?.unreadForAdmin && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full shadow-sm"></span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-bold truncate ${conv?.unreadForAdmin ? 'text-slate-900' : 'text-slate-700'}`}>
                              {getDoctorName(doctor)}
                            </span>
                            {conv?.lastMessageAt && (
                              <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 rtl:mr-2 rtl:ml-0">
                                {format(new Date(conv.lastMessageAt), 'HH:mm')}
                              </span>
                              )}
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded truncate max-w-[100px]">{doctor.specialtyAr || doctor.specialty || 'General'}</span>
                            <span className="text-[10px] text-slate-400 truncate">{doctor.state} - {doctor.city}</span>
                          </div>
                          {conv?.lastMessage && (
                            <p className={`text-xs truncate ${conv.unreadForAdmin ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                              {conv.lastMessage}
                            </p>
                            )}
                        </div>
                      </button>
                    </div>
                  ))
                  )}
              </div>
            </div>

            {/* Main Panel: Chat Area */}
            <div className={`flex-1 flex flex-col bg-white ${!selectedDoctorForChat ? 'hidden md:flex' : 'flex'}`}>
              {!selectedDoctorForChat ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                  <p>{t('select_conversation')}</p>
                </div>
              ) : (
                  <>
                  <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <button 
                        className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-lg mr-1 rtl:ml-1 rtl:mr-0"
                        onClick={() => setSelectedDoctorIdForChat(null)}
                      >
                      </button>
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {selectedDoctorForChat.photoUrl ? (
                          <img src={selectedDoctorForChat.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">{getDoctorName(selectedDoctorForChat)}</h2>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-500">{selectedDoctorForChat.specialtyAr || selectedDoctorForChat.specialty}</p>
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedDoctorForChat.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <p className="text-sm">{t('no_messages_yet')}</p>
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        if (msg.deletedForAdmin) return null;
                        const isMe = msg.senderRole === 'admin';                        return (
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
                                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {msg.text.includes('**') ? (
                                      <>
                                        <strong className="block mb-2 text-[15px]">{msg.text.split('**')[1]}</strong>
                                        {msg.text.split('**')[2]?.trim()}
                                      </>
                                    ) : (
                                      msg.text
                                    )}
                                  </p>
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

                  <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                      <div className="flex-1 relative">
                        <textarea name="newmessage" id="newmessage"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
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
                </>
                )}
            </div>
          </>
                )}

        {activeTab === 'broadcasts' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{t('broadcast_history') || t('tab_broadcasts')}</h2>
            
            {broadcasts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <p>{t('no_broadcasts')}</p>
              </div>
  ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {broadcasts.map(broadcast => (
                  <div key={broadcast.id} onClick={() => setSelectedBroadcast(broadcast)} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedBroadcast(broadcast); setShowDeleteBroadcastConfirm(true); }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('delete_broadcast_record')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <h3 className="font-bold text-slate-900 line-clamp-1">{broadcast.title}</h3>
                      </div>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-full whitespace-nowrap">
                        {format(new Date(broadcast.sentAt), 'yyyy-MM-dd HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 h-10">
                      {broadcast.text}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-900">{broadcast.recipientCount}</span>
                        <span>{t('recipients_count')}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-600">{broadcastStats[broadcast.id]?.sentOnly || 0}</span>
                        <span>{t('status_pending')}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-emerald-600">{broadcastStats[broadcast.id]?.delivered || 0}</span>
                        <span>{t('delivered_count')}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-blue-600">{broadcastStats[broadcast.id]?.read || 0}</span>
                        <span>{t('read_count')}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-amber-600">{broadcastStats[broadcast.id]?.unread || 0}</span>
                        <span>{t('unread_count')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                )}
          </div>
                )}
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <div className="flex items-center gap-3 text-blue-600">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                </div>
                <h3 className="text-lg font-bold">{t('send_message')}</h3>
              </div>
              <button 
                onClick={() => !sendingProgress && setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
                disabled={!!sendingProgress}
              >
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-xl text-sm font-medium mb-6 flex items-start gap-2">
                <p>{t('broadcast_confirm_desc').replace('{{count}}', selectedDoctorIds.size.toString())}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="broadcasttitle" className="block text-sm font-bold text-slate-700 mb-2">
                    {t('broadcast_title')}
                  </label>
                  <input name="broadcasttitle" id="broadcasttitle"
                    type="text"
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 outline-none"
                    placeholder={t('broadcast_title')}
                    disabled={!!sendingProgress}
                  />
                </div>
                <div>
                  <label htmlFor="broadcasttext" className="block text-sm font-bold text-slate-700 mb-2">
                    {t('broadcast_text')}
                  </label>
                  <textarea name="broadcasttext" id="broadcasttext"
                    value={broadcastText}
                    onChange={e => setBroadcastText(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none min-h-[120px]"
                    placeholder={t('broadcast_text')}
                    disabled={!!sendingProgress}
                  />
                </div>
              </div>

              {sendingProgress && (
                <div className="mt-6">
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                    <span>{t('sending_progress').replace('{{current}}', sendingProgress.current.toString()).replace('{{total}}', sendingProgress.total.toString())}</span>
                    <span>{Math.round((sendingProgress.current / sendingProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${(sendingProgress.current / sendingProgress.total) * 100}%` }} />
                  </div>
                </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowBroadcastModal(false)}
                disabled={!!sendingProgress}
                className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSendBroadcast}
                disabled={!!sendingProgress || !broadcastTitle.trim() || !broadcastText.trim()}
                className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {t('confirm_send')}
              </button>
            </div>
          </div>
        </div>
                )}

      {showDeleteBroadcastConfirm && selectedBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('confirm_delete_broadcast_record')}</h3>
              <p className="text-sm text-slate-500 mb-6">{t('confirm_delete_broadcast_desc')}</p>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3">
              <button
                onClick={() => { setShowDeleteBroadcastConfirm(false); setSelectedBroadcast(null); }}
                className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeleteBroadcast}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      <MessageModal
        isOpen={messageModal.open}
        type={messageModal.type}
        title={messageModal.title}
        message={messageModal.message}
        onClose={() => setMessageModal({ ...messageModal, open: false })} />
    </div>
    </>
  );
}
