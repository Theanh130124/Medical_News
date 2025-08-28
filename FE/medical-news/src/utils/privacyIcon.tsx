// components/common/PrivacyIcon.tsx
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { JSX } from "react";

interface PrivacyIconProps {
  privacyMode: string;
  className?: string;
  size?: string;
  color?: string;
}

const PrivacyIcon = ({ 
  privacyMode, 
  className = "", 
  size = "0.9rem", 
  color = "#6c757d" 
}: PrivacyIconProps): JSX.Element => {
  let icon: JSX.Element, tooltipText: string;
  
  switch(privacyMode) {
    case 'PUBLIC':
      icon = <i className="bi bi-globe"></i>;
      tooltipText = 'Công khai - Mọi người đều có thể xem';
      break;
    case 'FRIENDS_ONLY':
      icon = <i className="bi bi-people-fill"></i>;
      tooltipText = 'Chỉ bạn bè - Chỉ bạn bè có thể xem';
      break;
    case 'PRIVATE':
      icon = <i className="bi bi-lock-fill"></i>;
      tooltipText = 'Riêng tư - Chỉ mình tôi có thể xem';
      break;
    default:
      icon = <i className="bi bi-question-circle"></i>;
      tooltipText = 'Chế độ hiển thị không xác định';
  }
  
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{tooltipText}</Tooltip>}
    >
      <span 
        className={`ms-2 ${className}`} 
        style={{ fontSize: size, color: color }}
      >
        {icon}
      </span>
    </OverlayTrigger>
  );
};

export default PrivacyIcon;