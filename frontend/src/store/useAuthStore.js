import {create} from 'zustand'
import { axiosInstance } from '../lib/axios'
import {io} from 'socket.io-client'
import toast from 'react-hot-toast'

const BASE_URL = "http://localhost:5000";

export const useAuthStore = create((set, get) => ({
   authUser: null,
   isSigningUp: false,
   isLoggingIn: false,
   isUpdatingProfile: false,
   isCheckigAuth: true,
   onlineUsers:[],
   socket: null,
   
   checkAuth: async () => {
      try {
         const response = await axiosInstance.get('/auth/check')
         set({authUser: response.data})

         get().connectSocket();
      } catch (error) {
         console.error("Error in checkAuth:", error)
         set({authUser: null})
      } finally {
         set({isCheckigAuth: false})
      }
   },

   signup: async (data) => {
      try {
         const response = await axiosInstance.post('/auth/signup', data)
         set({authUser: response.data});
         toast.success("Account created successfully");

         get().connectSocket();
      } catch (error) {
         console.error("Error in signup:", error);
         toast.error(error.response.data.message);
      } finally {
         set({isSigningUp: false})
      }
   },

   logout: async () => {
      try {
         await axiosInstance.post('/auth/logout')
         set({authUser: null})
         toast.success("Logged out successfully")
         
      } catch (error) {
         console.error("Error in logout:", error)
         toast.error(error.response.data.message);
      }
   },

   login: async (data) => {
      set({isLoggingIn: true});
      try {
         const response = await axiosInstance.post('/auth/login', data)
         set({authUser: response?.data});
         toast.success("Logged in successfully");

         get().connectSocket();
      } catch (error) {
         console.error("Error in login:", error);
         toast.error(error.response.data.message);
      } finally {
         set({isLoggingIn: false});
      }
   },

   updateProfile: async (data) => {
      set({isUpdatingProfile: true})
      try {
         const response = await axiosInstance.put('/auth/update-profile', data)
         set({authUser: response.data})
         toast.success("Profile updated successfully")
      } catch (error) {
         console.error("Error in update profile:", error)
         toast.error(error.response.data.message);
      } finally {
         set({isUpdatingProfile: false});
      };
   },

   connectSocket: () => {
      const {authUser} = get();
      if(!authUser || get().socket?.connected) return;

      const socket = io(BASE_URL, {
         query: {
            userId: authUser._id
         },
      })

      socket.connect();

      set({socket: socket});

      socket.on("getOnlineUsers", (userIds) => {
         set({onlineUsers: userIds})
      })
      
   },

   disconnectSocket: () => {
      if(get().socket.connected){
         get().socket.disconnect()
      }
   },

}))   