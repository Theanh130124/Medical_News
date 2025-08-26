// utils/errorHandler.ts
import { showCustomToast } from "../component/layout/MyToaster"; 

export const handleApiError = (ex: any, defaultMsg: string = "Đã có lỗi xảy ra") => {
  console.error(ex);

  const beMsg =
    ex?.response?.data?.message ||  // backend trả về
    ex?.message ||                  // lỗi mặc định axios/js
    defaultMsg;                     // fallback

  showCustomToast(beMsg, "error");
  return beMsg;
};
