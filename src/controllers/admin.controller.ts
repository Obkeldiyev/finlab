import { ErrorHandler } from "@errors";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { sign, verify } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const client = new PrismaClient();

export class AdminController {
    static async createAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;

            const checkAdmin = await client.admin.findUnique({
                where: {
                    username
                }
            });

            if (checkAdmin) {
                res.status(400).send({
                    success: false,
                    message: "This admin is already exists"
                })
            } else {
                const newAdmin = await client.admin.create({
                    data: {
                        username,
                        password
                    }
                })

                res.status(202).send({
                    success: true,
                    message: "The admin created successfully"
                })
            }
        } catch (error: any) {
            next(new ErrorHandler(error.message, error.status));
        }
    }

    static async editAdminProfile(req: Request, res: Response, next: NextFunction) {
        try {
            // The token is already verified by middleware, user info is in req.user
            const userId = req.user?.id;
            
            if (!userId) {
                return res.status(401).send({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const { username, password } = req.body;

            const admin = await client.admin.findUnique({
                where: {
                    id: userId
                }
            });

            if (admin) {
                await client.admin.update({
                    data: {
                        username,
                        password
                    },
                    where: {
                        id: admin.id
                    }
                });

                res.status(200).send({
                    success: true,
                    message: "The profile edited successfully"
                })
            } else {
                res.status(404).send({
                    success: false,
                    message: "Admin not found"
                })
            }
        } catch (error: any) {
            next(new ErrorHandler(error.message, error.status));
        }
    }

    static async loginAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;

            const checkAdmin = await client.admin.findUnique({
                where: {
                    username,
                    password
                }
            });

            if (checkAdmin) {
                if (checkAdmin.password === password) {
                    const token = sign({id: checkAdmin.id, role: checkAdmin.role}, process.env.SECRET_KEY as string)
                    
                    res.status(200).send({
                        success: true,
                        message: "Welcome back admin",
                        token
                    });
                } else {
                    res.status(404).send({
                    success: false,
                    message: "The password is incorrect"
                })
                }
            } else {
                res.status(404).send({
                    success: false,
                    message: "This admin does not exists"
                })
            }
        } catch (error: any) {
            next(new ErrorHandler(error.message, error.status))
        }
    }

    static async getAdminProfile(req: Request, res: Response, next: NextFunction) {
        try {
            // The token is already verified by middleware, user info is in req.user
            const userId = req.user?.id;
            
            if (!userId) {
                return res.status(401).send({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const admin = await client.admin.findUnique({
                where: {
                    id: userId
                }
            });

            if (admin) {
                res.status(200).send({
                    success: true,
                    message: "Your profile",
                    data: admin,
                });
            } else {
                res.status(404).send({
                    success: false,
                    message: "This admin does not exists"
                });
            }
        } catch (error: any) {
            next(new ErrorHandler(error.message, error.status))
        }
    }
}