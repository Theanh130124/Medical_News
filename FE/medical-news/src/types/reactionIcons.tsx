import { JSX } from "react";
import "./Styles/reactions.css"; // file css riêng

export const reactionIcons: Record<string, JSX.Element> = {
  LIKE: <img src="/assets/images/like.jpg" alt="like" className="reaction-icon" />,
  LOVE: <img src="/assets/images/love.jpg" alt="love" className="reaction-icon" />,
  HAHA: <img src="/assets/images/haha.png" alt="haha" className="reaction-icon" />,
  SAD: <img src="/assets/images/sad.jpg" alt="sad" className="reaction-icon" />,
  ANGRY: <img src="/assets/images/angry.jpg" alt="angry" className="reaction-icon" />,
};
