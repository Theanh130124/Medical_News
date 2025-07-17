-- Xóa cơ sở dữ liệu (nếu tồn tại)
DROP DATABASE IF EXISTS medicalnewsdb;

-- Tạo CSDL
CREATE DATABASE medicalnewsdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medicalnewsdb;

-- 1. role
CREATE TABLE role (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID
    name ENUM('ADMIN', 'DOCTOR', 'USER') NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 2. permission
CREATE TABLE permission (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- 3. role_permission (Many-to-Many)
CREATE TABLE role_permission (
    role_id CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permission(id) ON DELETE CASCADE
);

-- 4. user
CREATE TABLE user (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID
    role_id CHAR(36) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NULL COMMENT 'Giới tính (Nam, Nữ, Khác), có thể NULL',
    date_of_birth DATE NULL COMMENT 'Ngày sinh, có thể NULL',
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

-- 7. certificate
CREATE TABLE certificate (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    image_certificate VARCHAR(255) NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 8. post
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

-- 9. survey_option
CREATE TABLE survey_option (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_id CHAR(36) NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE
);

-- 10. survey_vote
CREATE TABLE survey_vote (
    user_id CHAR(36) NOT NULL,
    option_id CHAR(36) NOT NULL,
    voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, option_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES survey_option(id) ON DELETE CASCADE
);

-- 11. imagepost
CREATE TABLE imagepost (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_image_url VARCHAR(255) NOT NULL,
    post_id CHAR(36) NOT NULL,
    FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE
);

-- 12. comment
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

-- 13. reaction
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

-- 14. notification
CREATE TABLE notification (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 15. invalidatedtoken
CREATE TABLE invalidatedtoken (
    id CHAR(36) PRIMARY KEY,
    expiry_time DATETIME NOT NULL
);

-- 16. search_history
CREATE TABLE search_history (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    keyword VARCHAR(255) NOT NULL,
    searched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Giới hạn lại việc lưu tìm kiếm
DELIMITER //
CREATE TRIGGER limit_search_history
AFTER INSERT ON search_history
FOR EACH ROW
BEGIN
    DELETE FROM search_history
    WHERE user_id = NEW.user_id
    AND id NOT IN (
        SELECT id FROM (
            SELECT id
            FROM search_history
            WHERE user_id = NEW.user_id
            ORDER BY searched_at DESC
            LIMIT 20
        ) AS temp
    );
END;
//
DELIMITER ;

-- Tạo index B-tree
ALTER TABLE search_history
ADD INDEX idx_user_search (user_id, searched_at DESC);

-- ---------------------------
-- INSERT dữ liệu mẫu
-- ---------------------------

-- Role
INSERT INTO role (name, description) VALUES 
('ADMIN', 'Administrator role'),
('DOCTOR', 'Doctor role'),
('USER', 'Normal user role');

-- Permission
INSERT INTO permission (name, description) VALUES 
('CREATE_POST', 'Create new posts'),
('EDIT_POST', 'Edit existing posts'),
('DELETE_POST', 'Delete posts'); 

-- Role Permission mapping
INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r JOIN permission p
WHERE r.name = 'ADMIN'; -- ADMIN có toàn quyền

INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r JOIN permission p
WHERE r.name = 'DOCTOR' AND p.name IN ('CREATE_POST');

-- Users
INSERT INTO user (role_id, username, first_name, last_name, phone_number, address, gender, date_of_birth, email, password, avatar)
VALUES 
((SELECT id FROM role WHERE name = 'ADMIN'), 'admin', 'Admin', '1', '0933033801', '123 Admin St', 'MALE', '1990-01-01', 'admin123@gmail.com', 'hashedpassword', 'avatar1.png'),
((SELECT id FROM role WHERE name = 'DOCTOR'), 'theanh', 'Trần', 'Thế Anh', '0911328970', '420 Lê Văn Thọ, Gò Vấp, TPHCM', 'MALE', '2004-01-03', 'doctor123@gmail.com', 'hashedpassword', 'avatar2.png'),
((SELECT id FROM role WHERE name = 'USER'), 'minhtuyet', 'Nguyễn', 'Minh Tuyết', '0522194804', 'Nhơn Đức, Nhà Bè, TPHCM', 'FEMALE', '2000-10-10', 'user123@gmail.com', 'hashedpassword', 'avatar3.png');






INSERT INTO post (user_id, title, content) 
SELECT id, 'Bài Viết Đầu Tiên', 'Đây là nội dung của bài viết đầu tiên'
FROM user WHERE username = 'admin';


INSERT INTO comment (post_id, user_id, content) 
SELECT p.id, u.id, 'Đây là bình luận đầu tiên.'
FROM post p
JOIN user u ON u.username = 'minhtuyet'
WHERE p.title = 'Bài Viết Đầu Tiên';



INSERT INTO reaction (user_id, post_id, type)
SELECT u.id, p.id, 'LIKE'
FROM user u
JOIN post p
WHERE u.username = 'minhtuyet' AND p.title = 'Bài Viết Đầu Tiên';


INSERT INTO imagepost (post_image_url, post_id)
SELECT 'post1_img1.png', p.id FROM post p WHERE p.title = 'Bài Viết Đầu Tiên';
INSERT INTO imagepost (post_image_url, post_id)
SELECT 'post1_img2.png', p.id FROM post p WHERE p.title = 'Bài Viết Đầu Tiên';


-- Thêm 1 bài viết khảo sát
INSERT INTO post (user_id, title, content, type)
SELECT id, 'Khảo Sát: Bạn thích loại vaccine nào?', 'Hãy chọn các loại vaccine bạn tin tưởng nhất.', 'SURVEY'
FROM user WHERE username = 'admin';

-- Lấy post_id của bài khảo sát mới tạo
SET @survey_post_id = (SELECT id FROM post WHERE title = 'Khảo Sát: Bạn thích loại vaccine nào?');

-- Thêm các lựa chọn cho khảo sát
INSERT INTO survey_option (post_id, option_text)
VALUES
(@survey_post_id, 'Pfizer'),
(@survey_post_id, 'Moderna'),
(@survey_post_id, 'AstraZeneca'),
(@survey_post_id, 'Sinopharm');

-- Lấy id của các option vừa thêm
SET @option_pfizer = (SELECT id FROM survey_option WHERE post_id = @survey_post_id AND option_text = 'Pfizer');
SET @option_moderna = (SELECT id FROM survey_option WHERE post_id = @survey_post_id AND option_text = 'Moderna');
SET @option_astrazeneca = (SELECT id FROM survey_option WHERE post_id = @survey_post_id AND option_text = 'AstraZeneca');
SET @option_sinopharm = (SELECT id FROM survey_option WHERE post_id = @survey_post_id AND option_text = 'Sinopharm');

-- Người dùng vote (cho phép chọn nhiều option)
-- User: minhtuyet vote cho Pfizer và Moderna
INSERT INTO survey_vote (user_id, option_id)
SELECT u.id, @option_pfizer FROM user u WHERE u.username = 'minhtuyet';
INSERT INTO survey_vote (user_id, option_id)
SELECT u.id, @option_moderna FROM user u WHERE u.username = 'minhtuyet';

-- User: theanh vote cho AstraZeneca
INSERT INTO survey_vote (user_id, option_id)
SELECT u.id, @option_astrazeneca FROM user u WHERE u.username = 'theanh';

-- User: admin vote cho Pfizer và Sinopharm
INSERT INTO survey_vote (user_id, option_id)
SELECT u.id, @option_pfizer FROM user u WHERE u.username = 'admin';
INSERT INTO survey_vote (user_id, option_id)
SELECT u.id, @option_sinopharm FROM user u WHERE u.username = 'admin';




-- Thêm 1 bài viết private
INSERT INTO post (user_id, title, content, type, visibility)
SELECT id, 'Chế độ Riêng Tư', 'Chỉ mình tôi xem được bài này.', 'NORMAL', 'PRIVATE'
FROM user WHERE username = 'admin';


