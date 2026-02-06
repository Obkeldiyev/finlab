import { ErrorHandler } from "@errors";
import { Courses, direction, PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { sign, verify } from "jsonwebtoken";
import dotenv from "dotenv";

import { genOtp, saveOtp, verifyOtp, checkOtp } from "../services/otp.service";
import { sendOtpSms } from "../services/eskiz.service";

dotenv.config();

const client = new PrismaClient();

function getTokenFromRequest(req: Request) {
  const tokenFromHeader = req.headers.token as string | undefined;
  if (tokenFromHeader) return tokenFromHeader;

  const auth = req.headers.authorization;
  if (!auth) return null;

  const parts = auth.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer")
    return parts[1];

  return auth;
}

export class UserController {
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await client.user.findMany({
        include: {
          course: true,
          direction: true
        }
      });
      res
        .status(200)
        .send({ success: true, message: "All users", data: users });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async createUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        first_name,
        last_name,
        middle_name,
        phone_number,
        status,
        course_id,
        direction_id,
      } = req.body;

      const checkUser = await client.user.findFirst({
        where: { OR: [{ email }, { phone_number }] },
      });

      if (checkUser) {
        return res
          .status(409)
          .send({ success: false, message: "This user already exists" });
      }

      const checkCourse: Courses | null = await client.courses.findUnique({
        where: { id: Number(course_id) },
      });

      const checkDirection: direction | null =
        await client.direction.findUnique({
          where: { id: Number(direction_id) },
        });

      if (!checkCourse || !checkDirection) {
        return res
          .status(400)
          .send({ success: false, message: "Course or direction is required" });
      }

      await client.user.create({
        data: {
          email,
          first_name,
          last_name,
          middle_name,
          phone_number,
          status,
          course: { connect: { id: checkCourse.id } },
          direction: { connect: { id: checkDirection.id } },
        },
      });

      return res
        .status(202)
        .send({ success: true, message: "The user created successfully" });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async userProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const token = getTokenFromRequest(req);
      if (!token) {
        return res
          .status(401)
          .send({ success: false, message: "Token required" });
      }

      const data: any = verify(token, process.env.SECRET_KEY as string);

      const user = await client.user.findUnique({
        where: { id: data.id },
        include: {
          course: true,
          direction: true
        }
      });

      if (!user) {
        return res
          .status(404)
          .send({ success: false, message: "User not found" });
      }

      return res
        .status(200)
        .send({ success: true, message: "Your profile", data: user });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async registerRequestCode(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { phone_number } = req.body;

      if (!phone_number) {
        return res
          .status(400)
          .send({ success: false, message: "phone_number required" });
      }

      const exists = await client.user.findFirst({ where: { phone_number } });
      if (exists) {
        return res
          .status(409)
          .send({ success: false, message: "This user already exists" });
      }

      const code = genOtp();
      await saveOtp("register", phone_number, code);

      await sendOtpSms(phone_number, code);

      return res.status(200).send({ success: true, message: "Code sent" });
    } catch (error: any) {
      const eskizData = error?.response?.data;
      if (eskizData) {
        return res.status(error.response.status).send({
          success: false,
          message: "Eskiz error",
          eskiz: eskizData,
        });
      }
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async verifyCodeOnly(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { code, phone_number } = req.body;

      if (!code || !phone_number) {
        return res
          .status(400)
          .send({ success: false, message: "Code and phone_number required" });
      }

      const ok = await checkOtp("register", phone_number, String(code));
      if (!ok) {
        return res
          .status(400)
          .send({ success: false, message: "Invalid or expired code" });
      }

      return res.status(200).send({ success: true, message: "Code verified" });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async registerVerifyCode(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {
        code,
        email,
        first_name,
        last_name,
        middle_name,
        phone_number,
      } = req.body;

      const ok = await verifyOtp("register", phone_number, String(code));
      if (!ok) {
        return res
          .status(400)
          .send({ success: false, message: "Invalid or expired code" });
      }

      const exists = await client.user.findFirst({
        where: { OR: [{ email }, { phone_number }] },
      });
      if (exists) {
        return res
          .status(409)
          .send({ success: false, message: "This user already exists" });
      }

      // Create user without course/direction - they can choose later from dashboard
      const user = await client.user.create({
        data: {
          email,
          first_name,
          last_name,
          middle_name: middle_name || "",
          phone_number,
          status: "ACTIVE",
          // course_id and direction_id are now optional
        },
      });

      const token = sign(
        { id: user.id, role: user.role },
        process.env.SECRET_KEY as string,
      );
      return res
        .status(201)
        .send({ success: true, message: "Registered successfully! You can now browse courses and register for them.", token });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async loginRequestCode(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email, phone_number } = req.body;

      const user = await client.user.findFirst({
        where: { email, phone_number },
      });
      if (!user) {
        return res
          .status(404)
          .send({ success: false, message: "This user does not exist" });
      }

      const code = genOtp();
      await saveOtp("login", phone_number, code);
      await sendOtpSms(phone_number, code);

      return res.status(200).send({ success: true, message: "Code sent" });
    } catch (error: any) {
      const eskizData = error?.response?.data;
      if (eskizData) {
        return res.status(error.response.status).send({
          success: false,
          message: "Eskiz error",
          eskiz: eskizData,
        });
      }
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async loginVerifyCode(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email, phone_number, code } = req.body;

      const ok = await verifyOtp("login", phone_number, String(code));
      if (!ok) {
        return res
          .status(400)
          .send({ success: false, message: "Invalid or expired code" });
      }

      const user = await client.user.findFirst({
        where: { email, phone_number },
      });
      if (!user) {
        return res
          .status(404)
          .send({ success: false, message: "This user does not exist" });
      }

      const token = sign(
        { id: user.id, role: user.role },
        process.env.SECRET_KEY as string,
      );
      return res
        .status(200)
        .send({ success: true, message: "Welcome back", token });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, first_name, last_name, middle_name, phone_number } =
        req.body;

      const checkUser = await client.user.findFirst({
        where: { OR: [{ email }, { phone_number }] },
      });

      if (!checkUser) {
        return res
          .status(404)
          .send({ success: false, message: "This user does not exist" });
      }

      await client.user.update({
        where: { id: checkUser.id },
        data: { email, first_name, last_name, middle_name, phone_number },
      });

      return res.status(200).send({ success: true, message: "Updated" });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async registerForCourse(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {
        course_id,
        direction_id,
        address,
        workplace,
        position,
      } = req.body;

      const token = getTokenFromRequest(req);
      if (!token) {
        return res
          .status(401)
          .send({ success: false, message: "Token required" });
      }

      const data: any = verify(token, process.env.SECRET_KEY as string);

      const user = await client.user.findUnique({ where: { id: data.id } });
      if (!user) {
        return res
          .status(404)
          .send({ success: false, message: "User not found" });
      }

      const checkCourse = await client.courses.findUnique({
        where: { id: Number(course_id) },
      });
      const checkDirection = await client.direction.findUnique({
        where: { id: Number(direction_id) },
      });

      if (!checkCourse || !checkDirection) {
        return res
          .status(400)
          .send({ success: false, message: "Course or direction not found" });
      }

      // Update user with course registration details
      await client.user.update({
        where: { id: user.id },
        data: {
          course_id: checkCourse.id,
          direction_id: checkDirection.id,
          address: address || null,
          workplace: workplace || null,
          position: position || null,
          status: "ENROLLED",
        },
      });

      return res
        .status(200)
        .send({
          success: true,
          message: "Successfully registered for the course!",
          course: checkCourse.title_en,
          direction: checkDirection.title_en
        });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async updateDirectionAndCourse(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { course_id, direction_id } = req.body;

      const token = getTokenFromRequest(req);
      if (!token) {
        return res
          .status(401)
          .send({ success: false, message: "Token required" });
      }

      const data: any = verify(token, process.env.SECRET_KEY as string);

      const user = await client.user.findUnique({ where: { id: data.id } });
      if (!user) {
        return res
          .status(403)
          .send({ success: false, message: "This user does not exist" });
      }

      const checkCourse = await client.courses.findUnique({
        where: { id: Number(course_id) },
      });
      const checkDirection = await client.direction.findUnique({
        where: { id: Number(direction_id) },
      });

      if (!checkCourse || !checkDirection) {
        return res
          .status(400)
          .send({ success: false, message: "Course or direction is required" });
      }

      await client.user.update({
        where: { id: user.id },
        data: {
          course: { connect: { id: checkCourse.id } },
          direction: { connect: { id: checkDirection.id } },
        },
      });

      return res
        .status(200)
        .send({ success: true, message: "Settings updated" });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
