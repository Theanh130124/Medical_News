-- Xóa cơ sở dữ liệu (nếu tồn tại)
DROP DATABASE IF EXISTS medicalnewsdb;
 -- Tạo csdl 
 CREATE DATABASE medicalnewsdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
use medicalnewsdb ;
-- 1. Role
CREATE TABLE Role (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID
    name ENUM('ADMIN', 'DOCTOR', 'USER') NOT NULL UNIQUE,
    description VARCHAR(255)
);
-- 2. Permission
CREATE TABLE Permission (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);
-- 3. Role-Permission (Many-to-Many)  -> 1 role có nhiều permission vd chỉnh sửa bài viết , xóa -> và quyền xóa bài viết cũng có thể thuộc nhiều role , như user, admin ...  
CREATE TABLE Role_Permission (
    role_id CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES Role(id) ON DELETE CASCADE, -- Xóa bảng tham chiếu đến thì bị xóa theo (tham chiếu đên bảng role ) -> xóa role có id thì các role_id trong bảng này bị xóa theo
    FOREIGN KEY (permission_id) REFERENCES Permission(id) ON DELETE CASCADE
);

-- 4. Users   -> mật khẩu bằng OTP ? --> 1 user có permisson thì sao ?  -> thêm cả updated_at
CREATE TABLE User (
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
    FOREIGN KEY (role_id) REFERENCES Role(id)
);
CREATE TABLE Follow (
    follower_id CHAR(36) NOT NULL,
    following_id CHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES User(id) ON DELETE CASCADE
);
CREATE TABLE Friends (
    first_user_id CHAR(36) NOT NULL,
    second_user_id CHAR(36) NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (first_user_id , second_user_id),
    FOREIGN KEY (first_user_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (second_user_id) REFERENCES User(id) ON DELETE CASCADE
);
-- 5. Chứng chỉ hành nghề (Doctor Only)  ->  Có thêm hình ảnh
CREATE TABLE Certificate (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID
    user_id CHAR(36) NOT NULL,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    image_certificate VARCHAR(255) NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);
-- 6. Posts
CREATE TABLE Post (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    allow_comments BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

Create table ImagePost (
	id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID
    post_image_url VARCHAR(255) NOT NULL ,
    post_id char(36) NOT NULL , 
    FOREIGN KEY (post_id) REFERENCES Post(id) on delete cascade
);

CREATE TABLE Comment (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID
    post_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES Post(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);
CREATE TABLE Reaction (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID
    user_id CHAR(36) NOT NULL,
    post_id CHAR(36) NOT NULL,
    type ENUM('LIKE', 'HAHA', 'LOVE', 'SAD', 'ANGRY') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, post_id), -- 1 user chỉ 1 reaction/bài
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Post(id) ON DELETE CASCADE
);
-- 13. Notifications
CREATE TABLE Notification (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID
    user_id CHAR(36) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);
CREATE TABLE Search_history (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID
    user_id CHAR(36) NOT NULL,
    keyword VARCHAR(255) NOT NULL,
    searched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

-- giới hạn lại việc lưu tìm kiếm 
DELIMITER //

CREATE TRIGGER limit_search_history
AFTER INSERT ON Search_history
FOR EACH ROW
BEGIN
    DELETE FROM Search_history
    WHERE user_id = NEW.user_id
    AND id NOT IN (
        SELECT id FROM (
            SELECT id
            FROM Search_history
            WHERE user_id = NEW.user_id
            ORDER BY searched_at DESC
            LIMIT 20
        ) AS temp
    );
END;
//
DELIMITER ;
                


-- build B-tree -> giúp tìm kiếm theo trường user_id đã có index sẳn , mà không cần quét các trường còn lại (username , firstname ... )
alter table Search_history 
ADD INDEX idx_user_search (user_id, searched_at DESC);  



-- insert data


INSERT INTO Role (name, description) VALUES 
('ADMIN', 'Administrator role'),
('DOCTOR', 'Doctor role'),
('USER', 'Normal user role');


INSERT INTO Permission (name, description) VALUES 
('CREATE_POST', 'Create new posts'),
('EDIT_POST', 'Edit existing posts'),
('DELETE_POST', 'Delete posts'); 

INSERT INTO Role_Permission (role_id, permission_id)
SELECT r.id, p.id
FROM Role r JOIN Permission p
WHERE r.name = 'ADMIN'; -- ADMIN có toàn quyền

INSERT INTO Role_Permission (role_id, permission_id)
SELECT r.id, p.id
FROM Role r JOIN Permission p
WHERE r.name = 'DOCTOR' AND p.name IN ('CREATE_POST');



INSERT INTO User (role_id, username, first_name, last_name, phone_number, address, gender, date_of_birth, email, password, avatar)
VALUES 
((SELECT id FROM Role WHERE name = 'ADMIN'), 'admin', 'Admin', '1', '0933033801', '123 Admin St', 'MALE', '1990-01-01', 'admin123@gmail.com', 'hashedpassword', 'avatar1.png'),
((SELECT id FROM Role WHERE name = 'DOCTOR'), 'theanh', 'Trần', 'Thế Anh', '0911328970', '420 Lê Văn Thọ , Phường 16 , Quận Gò Vấp , TPHCM', 'MALE', '2004-01-03', 'doctor123@gmail.com', 'hashedpassword', 'avatar2.png'),
((SELECT id FROM Role WHERE name = 'USER'), 'minhtuyet', 'Nguyễn', 'Thị Minh Tuyết', '0522194804', '768/11 Lê Văn Lương , Xã Nhơn Đức , Huyện Nhà Bè , TPHCM', 'FEMALE', '2000-10-10', 'user123@gmail.com', 'hashedpassword', 'avatar3.png');



INSERT INTO Post (user_id, title, content) 
SELECT id, 'Bài Viết Đầu Tiên', 'Đây là nội dung của bài viết đầu tiên'
FROM User WHERE username = 'admin';


INSERT INTO Comment (post_id, user_id, content) 
SELECT p.id, u.id, 'Đây là bình luận đầu tiên.'
FROM Post p
JOIN User u ON u.username = 'minhtuyet'
WHERE p.title = 'Bài Viết Đầu Tiên';



INSERT INTO Reaction (user_id, post_id, type)
SELECT u.id, p.id, 'LIKE'
FROM User u
JOIN Post p
WHERE u.username = 'minhtuyet' AND p.title = 'Bài Viết Đầu Tiên';


INSERT INTO ImagePost (post_image_url, post_id)
SELECT 'post1_img1.png', p.id FROM Post p WHERE p.title = 'Bài Viết Đầu Tiên';
INSERT INTO ImagePost (post_image_url, post_id)
SELECT 'post1_img2.png', p.id FROM Post p WHERE p.title = 'Bài Viết Đầu Tiên';



