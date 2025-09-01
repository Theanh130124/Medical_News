import { onRequest } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

// Cấp quyền dùng db
import { db } from "../configs/FirebaseConfigs";

interface ChatParticipants {
  [userId: string]: boolean;
}

interface MessageData {
  senderId: string;
  text?: string;
  timestamp: FieldValue;
  imageUrl?: string;
}

interface ChatData {
  participants: ChatParticipants;
  createdAt: FieldValue;
}

const app = express();




// CẤU HÌNH CORS ĐÚNG CÁCH - ĐẶT Ở ĐẦU TIÊN
const corsOptions = {
  origin: ["http://localhost:3000", ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "userid", "x-user-id"],
  credentials: true,
  optionsSuccessStatus: 200
};

// Áp dụng CORS middleware đầu tiên
app.use(cors(corsOptions));

// Xử lý preflight requests cho tất cả routes
app.options("*", cors(corsOptions));

// Middleware khác
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/chats", async (req: Request, res: Response) => {
  try {
    const { userId1, userId2 } = req.body;

    if (!userId1 || !userId2) {
      return res.status(400).send({ error: "Thiếu userId1 hoặc userId2" });
    }

    const chatId = [userId1, userId2].sort().join("_");
    const chatRef = db.collection("chats").doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      await chatRef.set({
        participants: {
          [userId1]: true,
          [userId2]: true,
        },
        createdAt: FieldValue.serverTimestamp()
      } as ChatData);

      const docRef = await chatRef.collection("messages").add({});
      const createdDoc = await docRef.get();
      return res.status(201).send({
        chatId: docRef.id,
        ...createdDoc.data()
      });
    } else {
      return res.status(200).send({ chatId, message: "Cuộc trò chuyện đã tồn tại" });
    }
  } catch (error) {
    console.error("Lỗi khi tạo cuộc trò chuyện:", error);
    return res.status(500).send({ error: "Không thể tạo cuộc trò chuyện" });
  }
});

app.get("/chats/:chatId/messages", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["userid"] as string || req.headers["x-user-id"] as string;
    const { chatId } = req.params;
    const { limit = 50, orderBy = "timestamp", orderDirection = "asc", startAfter } = req.query;

    if (!userId) {
      return res.status(400).send({ error: "Thiếu userId" });
    }

    const chatRef = db.collection("chats").doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      return res.status(404).send({ error: "Phòng chat không tồn tại" });
    }

    const participants = chatDoc.data()?.participants || {};
    if (!participants[userId]) {
      return res.status(403).send({ error: "Bạn không thuộc đoạn chat này" });
    }

    const messagesRef = db.collection("chats").doc(chatId).collection("messages");
    let query = messagesRef.orderBy(orderBy as string, orderDirection as "asc" | "desc").limit(parseInt(limit as string));

    if (startAfter) {
      const lastDoc = await db.collection("chats").doc(chatId).collection("messages").doc(startAfter as string).get();
      if (!lastDoc.exists) {
        return res.status(400).send({ error: "ID tài liệu startAfter không hợp lệ" });
      }
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    const messages = snapshot.docs.map(doc => ({
      messageId: doc.id,
      ...doc.data()
    }));

    return res.status(200).send(messages);
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn:", error);
    return res.status(500).send({ error: "Không thể lấy tin nhắn" });
  }
});

app.get("/chats/:chatId/participants", async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const chatRef = db.collection("chats").doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      return res.status(404).send({ error: "Không tìm thấy cuộc trò chuyện" });
    }

    return res.status(200).send(chatDoc.data()?.participants || {});
  } catch (error) {
    console.error("Lỗi khi lấy người tham gia:", error);
    return res.status(500).send({ error: "Không thể lấy người tham gia" });
  }
});

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

app.post("/chats/:chatId/messages", async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { senderId, text, imageUrl } = req.body;

    if (!senderId || (!text && !imageUrl)) {
      return res.status(400).send({ error: "Thiếu senderId hoặc text" });
    }

    if (imageUrl && !isValidUrl(imageUrl)) {
      return res.status(400).send({ error: "URL ảnh không hợp lệ" });
    }

    if (text && text.length > 1000) {
      return res.status(400).send({ error: "Tin nhắn quá dài" });
    }

    const chatRef = db.collection("chats").doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      return res.status(404).send({ error: "Phòng chat không tồn tại" });
    }

    const participants = chatDoc.data()?.participants || {};
    if (!participants[senderId]) {
      return res.status(403).send({ error: "Bạn không thuộc đoạn chat này" });
    }

    const messagesRef = db.collection("chats").doc(chatId).collection("messages");
    const newMessage: MessageData = {
      senderId: senderId,
      text: text,
      timestamp: FieldValue.serverTimestamp(),
      ...(imageUrl && { imageUrl: imageUrl }),
    };

    const docRef = await messagesRef.add(newMessage);
    const createdDoc = await docRef.get();
    return res.status(201).send({
      messageId: docRef.id,
      ...createdDoc.data()
    });
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn", error);
    return res.status(500).send({ error: "Không thể gửi tin nhắn !!!" });
  }
});

app.get("/unread-message-counts", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["userid"] as string || req.headers["x-user-id"] as string;
    
    if (!userId) {
      return res.status(400).send({ error: "Thiếu userId" });
    }

    // Get all chats where the user is a participant
    const chatsSnapshot = await db.collection("chats")
      .where(`participants.${userId}`, "==", true)
      .get();

    if (chatsSnapshot.empty) {
      return res.status(200).send({ result: {} });
    }

    const unreadCounts: Record<string, number> = {};
    
    // Process each chat to count unread messages
    for (const chatDoc of chatsSnapshot.docs) {
      const chatData = chatDoc.data();
      const participants = chatData.participants || {};
      
      // Find the other participant (friend)
      const friendIds = Object.keys(participants).filter(id => id !== userId);
      
      if (friendIds.length === 0) continue;
      
      const friendId = friendIds[0];
      const chatId = chatDoc.id;
      
      try {
        // Get user's last read timestamp
        const userStatusRef = db.collection("user_chat_status")
          .doc(`${userId}_${chatId}`);
        const userStatusDoc = await userStatusRef.get();
        
        let lastReadTimestamp = 0;
        
        if (userStatusDoc.exists) {
          const statusData = userStatusDoc.data();
          lastReadTimestamp = statusData?.lastReadTimestamp?.toDate?.()?.getTime() || 0;
        }
        
        // Query messages that are unread (after lastReadTimestamp)
        const messagesQuery = db.collection("chats")
          .doc(chatId)
          .collection("messages")
          .where("timestamp", ">", new Date(lastReadTimestamp))
          .where("senderId", "!=", userId);
          
        const messagesSnapshot = await messagesQuery.get();
        const unreadCount = messagesSnapshot.size;
        
        // Add to the result
        if (unreadCount > 0) {
          unreadCounts[friendId] = (unreadCounts[friendId] || 0) + unreadCount;
        }
        
      } catch (error) {
        console.error(`Lỗi khi đếm tin nhắn cho chat ${chatId}:`, error);
      }
    }
    
    return res.status(200).send({ result: unreadCounts });
    
  } catch (error) {
    console.error("Lỗi khi lấy số tin nhắn chưa đọc:", error);
    return res.status(500).send({ error: "Không thể lấy số tin nhắn chưa đọc" });
  }
});

app.post("/mark-messages-as-read", async (req: Request, res: Response) => {
  try {
    const { userId, chatId } = req.body;
    
    if (!userId || !chatId) {
      return res.status(400).send({ error: "Thiếu userId hoặc chatId" });
    }
    
    const userStatusRef = db.collection("user_chat_status")
      .doc(`${userId}_${chatId}`);
    
    await userStatusRef.set({
      userId,
      chatId,
      lastReadTimestamp: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    
    return res.status(200).send({ success: true });
    
  } catch (error) {
    console.error("Lỗi khi đánh dấu tin nhắn đã đọc:", error);
    return res.status(500).send({ error: "Không thể đánh dấu tin nhắn đã đọc" });
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error:", err);
  
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File quá lớn, giới hạn là 5MB" });
  }

  return res.status(500).json({ error: err.message || "Đã xảy ra lỗi server." });
});


export const api = onRequest(app);