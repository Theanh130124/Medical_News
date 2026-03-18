package com.theanh1301.SpringBoot_Medical_News.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "chat_message")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "conversation_id", nullable = false)
    ChatConversation conversation;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Lob
    @Column(name = "content", nullable = false)
    String content;

    @Column(name = "message_type", nullable = false)
    String messageType; // "user" hoặc "bot"

    @Column(name = "timestamp")
    Instant timestamp;

    // Optional
    @Column(name = "has_image")
    Boolean hasImage;

    @Column(name = "image_url")
    String imageUrl;

    @Column(name = "is_html")
    Boolean isHtml;

    @PrePersist
    protected void onCreate() {
        this.timestamp = Instant.now();
        if (this.hasImage == null) this.hasImage = false;
        if (this.isHtml == null) this.isHtml = false;
    }
}