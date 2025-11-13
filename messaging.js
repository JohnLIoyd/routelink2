import { db } from "./firebase-config.js";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

function buildConversationId(uidA, uidB) {
    return [uidA, uidB].sort().join("__");
}

function buildInitials(name = "") {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return "";
    }
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

async function fetchContacts(currentUser) {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const contacts = [];

    usersSnapshot.forEach((docSnapshot) => {
        if (docSnapshot.id === currentUser.uid) {
            return;
        }

        const data = docSnapshot.data() || {};
        const name = data.name || data.email || "Unknown";

        contacts.push({
            id: docSnapshot.id,
            name,
            email: data.email || "",
            role: data.role || "",
            initials: buildInitials(name),
            conversationId: buildConversationId(currentUser.uid, docSnapshot.id)
        });
    });

    const hydratedContacts = await Promise.all(
        contacts.map(async (contact) => {
            const conversationRef = doc(db, "conversations", contact.conversationId);
            const conversationSnap = await getDoc(conversationRef);

            if (conversationSnap.exists()) {
                const conversation = conversationSnap.data();
                return {
                    ...contact,
                    lastMessage: conversation.lastMessage || "",
                    lastMessageAt: conversation.lastMessageAt?.toDate?.() || null
                };
            }

            return {
                ...contact,
                lastMessage: "",
                lastMessageAt: null
            };
        })
    );

    return hydratedContacts.sort((a, b) => {
        const aTime = a.lastMessageAt ? a.lastMessageAt.getTime() : 0;
        const bTime = b.lastMessageAt ? b.lastMessageAt.getTime() : 0;
        return bTime - aTime;
    });
}

async function ensureConversation(currentUser, contact) {
    const conversationId = buildConversationId(currentUser.uid, contact.id);
    const conversationRef = doc(db, "conversations", conversationId);
    const participantInfo = {
        [currentUser.uid]: {
            name: currentUser.name || currentUser.email || "Unknown",
            role: currentUser.role || "",
            email: currentUser.email || ""
        },
        [contact.id]: {
            name: contact.name || contact.email || "Unknown",
            role: contact.role || "",
            email: contact.email || ""
        }
    };

    await setDoc(
        conversationRef,
        {
            participants: [currentUser.uid, contact.id],
            participantInfo,
            updatedAt: serverTimestamp()
        },
        { merge: true }
    );

    return {
        id: conversationId,
        ref: conversationRef
    };
}

function subscribeToMessages(conversationId, callback) {
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));

    return onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map((docSnapshot) => {
            const data = docSnapshot.data();
            return {
                id: docSnapshot.id,
                text: data.text || "",
                senderId: data.senderId,
                senderName: data.senderName || "",
                senderRole: data.senderRole || "",
                createdAt: data.createdAt?.toDate?.() || null
            };
        });

        callback(messages);
    });
}

async function sendMessage(conversationId, message) {
    const messagesRef = collection(db, "conversations", conversationId, "messages");

    await addDoc(messagesRef, {
        text: message.text,
        senderId: message.senderId,
        senderName: message.senderName || "",
        senderRole: message.senderRole || "",
        createdAt: serverTimestamp()
    });

    const conversationRef = doc(db, "conversations", conversationId);
    await setDoc(
        conversationRef,
        {
            lastMessage: message.text,
            lastMessageAt: serverTimestamp(),
            lastSenderId: message.senderId
        },
        { merge: true }
    );
}

window.messagingAPI = {
    fetchContacts,
    ensureConversation,
    subscribeToMessages,
    sendMessage,
    buildConversationId
};

