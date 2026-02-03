const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendMarketingNotification = functions.firestore
  .document("marketing_notifications/{docId}")
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    
    // 1. Get the message details from the document
    const title = data.title;
    const body = data.body;
    const imageUrl = data.imageUrl || "";
    const target = data.target || "all"; // 'all', 'premium', or 'free'

    // 2. Define the "Topic" to send to
    // (Your Android app must subscribe users to these topics!)
    let topic = "all_users"; 
    if (target === "premium") topic = "premium_users";
    if (target === "free") topic = "free_users";

    // 3. Construct the FCM Message
    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK", // Standard for many apps
        screen: "notifications", // Custom data your app can read
      },
      topic: topic, // <--- Sends to everyone subscribed to this topic
    };

    // Add image if present
    if (imageUrl) {
        message.notification.imageUrl = imageUrl;
    }

    try {
      // 4. Send the message via Firebase Admin SDK
      const response = await admin.messaging().send(message);
      console.log("Successfully sent message:", response);

      // 5. Update the DB document to say "sent"
      return snapshot.ref.update({ 
          status: "sent", 
          sentMessageId: response 
      });

    } catch (error) {
      console.error("Error sending message:", error);
      return snapshot.ref.update({ 
          status: "failed", 
          error: error.message 
      });
    }
  });