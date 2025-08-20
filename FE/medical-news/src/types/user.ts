export interface Role {
  name: string;
  description: string;
}



export interface UserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean | null;
  address: string;
  email: string;
  gender: string;
  avatar: string;
  dateOfBirth: string;
  role: Role;
  createdAt: string;
  doctor: any; 
}
