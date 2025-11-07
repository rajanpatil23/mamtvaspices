import { apiSlice } from "../slices/ApiSlice";
import { setUser, logout } from "../slices/AuthSlice";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  avatar: string | null;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation<
      { accessToken: string; user: User; cart?: any },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/sign-in",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Cart"], // ✅ Refresh cart after login to show merged items
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Backend returns { success, message, user, cart }
          dispatch(setUser({ user: data.user }));
          console.log("✅ [AUTH API] Login successful, cart received:", data.cart);
          console.log("✅ [AUTH API] Cart items count:", data.cart?.cartItems?.length);
        } catch (error) {
          // Error is handled in the component, just prevent uncaught promise
          console.log("Login failed:", error);
        }
      },
    }),
    signup: builder.mutation<
      { accessToken: string; user: User; cart?: any },
      { name: string; email: string; password: string }
    >({
      query: (data) => ({
        url: "/auth/sign-up",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cart"], // ✅ Refresh cart after signup to show merged items
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Backend returns { success, message, user, cart }
          dispatch(setUser({ user: data.user }));
          console.log("✅ [AUTH API] Signup successful, cart received:", data.cart);
          console.log("✅ [AUTH API] Cart items count:", data.cart?.cartItems?.length);
        } catch (error) {
          // Error is handled in the component, just prevent uncaught promise
          console.log("Signup failed:", error);
        }
      },
    }),
    signOut: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/sign-out",
        method: "GET",
      }),
      invalidatesTags: ["Cart"], // ✅ Clear cart cache on logout
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        await queryFulfilled;
        dispatch(logout());
      },
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: ({ email }) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
    resetPassword: builder.mutation<void, { token: string; password: string }>({
      query: ({ token, password }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: { token, password },
      }),
    }),
    checkAuth: builder.mutation<{ accessToken: string; user: User }, void>({
      query: () => ({
        url: "/auth/refresh-token",
        method: "POST",
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        // Backend returns { success, message, user }
        dispatch(setUser({ user: data.user }));
      },
    }),
  }),
});

export const {
  useSignInMutation,
  useSignupMutation,
  useSignOutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useCheckAuthMutation,
} = authApi;
