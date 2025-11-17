import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { cookieOptions } from "@/shared/constants";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { AuthService } from "./auth.service";
import { tokenUtils } from "@/shared/utils/authUtils";
import AppError from "@/shared/errors/AppError";
import { CartService } from "../cart/cart.service";
import { makeLogsService } from "@modules/logs/logs.factory";

const { ...clearCookieOptions } = cookieOptions;

export class AuthController {
  private logsService = makeLogsService();
  constructor(
    private authService: AuthService,
    private cartService?: CartService
  ) {}

  signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const start = Date.now();
    
    // ✅ Save old session ID BEFORE registration (for guest cart merge)
    const oldSessionId = req.session.id;
    console.log("🔍 [AUTH] Old session ID before signup:", oldSessionId);
    
    const { name, email, password, role } = req.body;
    const { user, accessToken, refreshToken } =
      await this.authService.registerUser({
        name,
        email,
        password,
        role,
      });

    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.cookie("accessToken", accessToken, cookieOptions);

    const userId = user.id;
    
    console.log("🔍 [AUTH] New session ID after signup:", req.session.id);
    console.log("🔍 [AUTH] Merging cart with old session ID:", oldSessionId);

    // ✅ Use OLD session ID to find and merge guest cart, get merged cart back
    const mergedCart = await this.cartService?.mergeCartsOnLogin(oldSessionId, userId);
    console.log("🔍 [AUTH] Merged cart received:", mergedCart);
    console.log("🔍 [AUTH] Merged cart items count:", mergedCart?.cartItems?.length);

    const end = Date.now();
    
    sendResponse(res, 201, {
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          avatar: user.avatar || null,
        },
        cart: mergedCart, // ✅ Include merged cart in response
      },
    });
    this.logsService.info("Register", {
      userId,
      sessionId: req.session.id,
      timePeriod: end - start,
    });
  });

  signin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const start = Date.now();
    
    // ✅ Save old session ID BEFORE login (for guest cart merge)
    const oldSessionId = req.session.id;
    console.log("🔍 [AUTH] ==================== LOGIN START ====================");
    console.log("🔍 [AUTH] Old session ID before signin:", oldSessionId);
    console.log("🔍 [AUTH] Session object:", JSON.stringify(req.session, null, 2));
    console.log("🔍 [AUTH] Cookies:", req.cookies);
    
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await this.authService.signin({
      email,
      password,
    });

    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.cookie("accessToken", accessToken, cookieOptions);

    const userId = user.id;
    
    console.log("🔍 [AUTH] New session ID after signin:", req.session.id);
    console.log("🔍 [AUTH] User ID:", userId);
    console.log("🔍 [AUTH] About to merge cart with old session ID:", oldSessionId);
    
    // ✅ Use OLD session ID to find and merge guest cart, get merged cart back
    const mergedCart = await this.cartService?.mergeCartsOnLogin(oldSessionId, userId);
    console.log("🔍 [AUTH] Merged cart received:", JSON.stringify(mergedCart, null, 2));
    console.log("🔍 [AUTH] Merged cart items count:", mergedCart?.cartItems?.length);
    console.log("🔍 [AUTH] ==================== LOGIN END ====================");

    const end = Date.now();

    sendResponse(res, 200, {
      data: {
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
        cart: mergedCart, // ✅ Include merged cart in response
      },
      message: "User logged in successfully",
    });

    this.logsService.info("Sign in", {
      userId,
      sessionId: req.session.id,
      timePeriod: end - start,
    });
  });

  signout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const start = Date.now();
    const refreshToken = req?.cookies?.refreshToken;
    const userId = req.user?.id;

    if (refreshToken) {
      const decoded: any = jwt.decode(refreshToken);
      if (decoded && decoded.absExp) {
        const now = Math.floor(Date.now() / 1000);
        const ttl = decoded.absExp - now;
        if (ttl > 0) {
          await tokenUtils.blacklistToken(refreshToken, ttl);
        }
      }
    }

    res.clearCookie("refreshToken", {
      ...clearCookieOptions,
    });

    res.clearCookie("accessToken", {
      ...clearCookieOptions,
    });

    sendResponse(res, 200, { message: "Logged out successfully" });
    const end = Date.now();

    this.logsService.info("Sign out", {
      userId,
      sessionId: req.session.id,
      timePeriod: end - start,
    });
  });

  forgotPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;
      const response = await this.authService.forgotPassword(email);
      const userId = req.user?.id;

      sendResponse(res, 200, { message: response.message });
      const start = Date.now();
      const end = Date.now();

      this.logsService.info("Forgot Password", {
        userId,
        sessionId: req.session.id,
        timePeriod: end - start,
      });
    }
  );

  resetPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { token, newPassword } = req.body;
      const response = await this.authService.resetPassword(token, newPassword);
      const userId = req.user?.id;

      sendResponse(res, 200, { message: response.message });
      const start = Date.now();
      const end = Date.now();

      this.logsService.info("Reset Password", {
        userId,
        sessionId: req.session.id,
        timePeriod: end - start,
      });
    }
  );

  refreshToken = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const start = Date.now();
      const oldRefreshToken = req?.cookies?.refreshToken;

      if (!oldRefreshToken) {
        throw new AppError(401, "Refresh token not found");
      }

      const { newAccessToken, newRefreshToken, user } =
        await this.authService.refreshToken(oldRefreshToken);

      res.cookie("refreshToken", newRefreshToken, cookieOptions);

      sendResponse(res, 200, {
        message: "Token refreshed successfully",
        data: { accessToken: newAccessToken, user },
      });
      const end = Date.now();

      this.logsService.info("Refresh Token", {
        userId: req.user?.id,
        sessionId: req.session.id,
        timePeriod: end - start,
      });
    }
  );
}
