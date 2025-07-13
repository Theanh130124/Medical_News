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
CREATE TABLE friends (
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
    image VARCHAR(255),
    allow_comments BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
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
)

-- giới hạn lại việc lưu tìm kiếm 
delimiter // 

create trigger limit_search_history
after insert on Search_history
for each row
begin	
	delete from Search_history
    where user_id = NEW.user_id
		and id not in (
			select id from (
				select id 
                from Search_history
                where user_id = NEW.user_id
                order by search_at desc
                limit 20
                ) AS sub
                );
                END;
                
//
DELIMITER ;
                


-- build B-tree -> giúp tìm kiếm theo trường user_id đã có index sẳn , mà không cần quét các trường còn lại (username , firstname ... )
alter table Search_history 
ADD INDEX idx_user_search (user_id, searched_at DESC);  



