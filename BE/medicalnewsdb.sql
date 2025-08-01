
DROP DATABASE IF EXISTS medicalnewsdb;


CREATE DATABASE medicalnewsdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medicalnewsdb;

-- 1. role -> CỦA NHIỀU USER
CREATE TABLE role (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name ENUM('ADMIN', 'DOCTOR', 'USER') NOT NULL UNIQUE,
    description VARCHAR(255)
);


-- 2. user  -> CÓ 1 ROLE
CREATE TABLE user (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    role_id CHAR(36) NOT NULL ,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    date_of_birth DATE NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) NOT NULL,
    cover_image VARCHAR(255),
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES role(id)
);

-- 3. doctor
CREATE TABLE doctor (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL UNIQUE, -- unique để  1 - 1
    specialty VARCHAR(100), -- chuyên khoa
    years_of_experience INT,
    workplace VARCHAR(255),
    educational_level VARCHAR(100),
    introduction TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
-- 4. certificate (liên kết tới doctor)
CREATE TABLE certificate (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    doctor_id CHAR(36) NOT NULL,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    image_certificate VARCHAR(255) NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE
);

-- 5. follow
CREATE TABLE follow (
    follower_id CHAR(36) NOT NULL,
    following_id CHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 6. friends
CREATE TABLE friends (
    first_user_id CHAR(36) NOT NULL,
    second_user_id CHAR(36) NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (first_user_id, second_user_id),
    FOREIGN KEY (first_user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (second_user_id) REFERENCES user(id) ON DELETE CASCADE
);



-- 7. post
CREATE TABLE post (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    visibility ENUM('PUBLIC', 'FRIENDS_ONLY', 'PRIVATE') DEFAULT 'PUBLIC',
    type ENUM('NORMAL', 'SURVEY') DEFAULT 'NORMAL',
    allow_comments BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
-- 8. survey_option
CREATE TABLE survey_option (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_id CHAR(36) NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE
);

-- 9. survey_vote
CREATE TABLE survey_vote (
    user_id CHAR(36) NOT NULL,
    option_id CHAR(36) NOT NULL,
    voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, option_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES survey_option(id) ON DELETE CASCADE
);

-- 10. imagepost
CREATE TABLE imagepost (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_image_url VARCHAR(255) NOT NULL,
    post_id CHAR(36) NOT NULL,
    FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE
);

-- 11. comment
CREATE TABLE comment (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 12. reaction
CREATE TABLE reaction (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    post_id CHAR(36) NOT NULL,
    type ENUM('LIKE', 'HAHA', 'LOVE', 'SAD', 'ANGRY') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE
);

-- 13. notification
CREATE TABLE notification (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 14. invalidatedtoken
CREATE TABLE invalidatedtoken (
    id CHAR(36) PRIMARY KEY,
    expiry_time DATETIME NOT NULL
);

-- 15. search_history
CREATE TABLE search_history (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    keyword VARCHAR(255) NOT NULL,
    searched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Giới hạn chỉ lưu 20 từ khóa tìm kiếm gần nhất
DELIMITER //
CREATE TRIGGER limit_search_history
AFTER INSERT ON search_history
FOR EACH ROW
BEGIN
    DELETE FROM search_history
    WHERE user_id = NEW.user_id
    AND id NOT IN (
        SELECT id FROM (
            SELECT id FROM search_history
            WHERE user_id = NEW.user_id
            ORDER BY searched_at DESC
            LIMIT 20
        ) AS temp
    );
END;
//
DELIMITER ;

-- Index tăng hiệu suất tìm kiếm
ALTER TABLE search_history
ADD INDEX idx_user_search (user_id, searched_at DESC);


-- ---------------------------
-- INSERT dữ liệu mẫu
-- ---------------------------

-- Roles
INSERT INTO role (name, description) VALUES 
('ADMIN', 'Administrator role'),
('DOCTOR', 'Doctor role'),
('USER', 'Normal user role');

-- Users
INSERT INTO user (role_id, username, first_name, last_name, phone_number, address, gender, date_of_birth, email, password, avatar)
VALUES 
((SELECT id FROM role WHERE name = 'ADMIN'), 'admin', 'Admin', '1', '0933033801', '123 Admin St', 'MALE', '1990-01-01', 'admin123@gmail.com', 'hashedpassword', 'avatar1.png'),
((SELECT id FROM role WHERE name = 'DOCTOR'), 'theanh', 'Trần', 'Thế Anh', '0911328970', '420 Lê Văn Thọ, Gò Vấp, TPHCM', 'MALE', '2004-01-03', 'doctor123@gmail.com', 'hashedpassword', 'avatar2.png'),
((SELECT id FROM role WHERE name = 'USER'), 'minhtuyet', 'Nguyễn', 'Minh Tuyết', '0522194804', 'Nhơn Đức, Nhà Bè, TPHCM', 'FEMALE', '2000-10-10', 'user123@gmail.com', 'hashedpassword', 'avatar3.png');

-- Posts
INSERT INTO post (user_id, title, content) 
SELECT id, 'Bài Viết Đầu Tiên', 'Đây là nội dung của bài viết đầu tiên'
FROM user WHERE username = 'admin';

-- Comments
INSERT INTO comment (post_id, user_id, content) 
SELECT p.id, u.id, 'Đây là bình luận đầu tiên.'
FROM post p
JOIN user u ON u.username = 'minhtuyet'
WHERE p.title = 'Bài Viết Đầu Tiên';

-- Reactions
INSERT INTO reaction (user_id, post_id, type)
SELECT u.id, p.id, 'LIKE'
FROM user u
JOIN post p
WHERE u.username = 'minhtuyet' AND p.title = 'Bài Viết Đầu Tiên';

-- Image posts
INSERT INTO imagepost (post_image_url, post_id)
SELECT 'post1_img1.png', p.id FROM post p WHERE p.title = 'Bài Viết Đầu Tiên';
INSERT INTO imagepost (post_image_url, post_id)
SELECT 'post1_img2.png', p.id FROM post p WHERE p.title = 'Bài Viết Đầu Tiên';

-- Survey post
INSERT INTO post (user_id, title, content, type)
SELECT id, 'Khảo Sát: Bạn thích loại vaccine nào?', 'Hãy chọn các loại vaccine bạn tin tưởng nhất.', 'SURVEY'
FROM user WHERE username = 'admin';

SET @survey_post_id = (SELECT id FROM post WHERE title = 'Khảo Sát: Bạn thích loại vaccine nào?');
INSERT INTO survey_option (post_id, option_text)
VALUES
(@survey_post_id, 'Pfizer'),
(@survey_post_id, 'Moderna'),
(@survey_post_id, 'AstraZeneca'),
(@survey_post_id, 'Sinopharm');

-- Vote
SET @option_pfizer = (SELECT id FROM survey_option WHERE post_id = @survey_post_id AND option_text = 'Pfizer');
SET @option_moderna = (SELECT id FROM survey_option WHERE post_id = @survey_post_id AND option_text = 'Moderna');
SET @option_astrazeneca = (SELECT id FROM survey_option WHERE post_id = @survey_post_id AND option_text = 'AstraZeneca');
SET @option_sinopharm = (SELECT id FROM survey_option WHERE post_id = @survey_post_id AND option_text = 'Sinopharm');

INSERT INTO survey_vote (user_id, option_id)
SELECT u.id, @option_pfizer FROM user u WHERE u.username = 'minhtuyet';
INSERT INTO survey_vote (user_id, option_id)
SELECT u.id, @option_moderna FROM user u WHERE u.username = 'minhtuyet';
INSERT INTO survey_vote (user_id, option_id)
SELECT u.id, @option_astrazeneca FROM user u WHERE u.username = 'theanh';
INSERT INTO survey_vote (user_id, option_id)
SELECT u.id, @option_pfizer FROM user u WHERE u.username = 'admin';
INSERT INTO survey_vote (user_id, option_id)
SELECT u.id, @option_sinopharm FROM user u WHERE u.username = 'admin';

-- Private post
INSERT INTO post (user_id, title, content, type, visibility)
SELECT id, 'Chế độ Riêng Tư', 'Chỉ mình tôi xem được bài này.', 'NORMAL', 'PRIVATE'
FROM user WHERE username = 'admin';


