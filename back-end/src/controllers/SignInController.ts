import { Request, Response } from "express";

import { validateUser } from "../db/helpers/UserValidation";

/**
 * A controller for handling user sign ins
 */
export class SignInController {

  /**
   * Check if the current user exists in the database
   *
   * @param req
   * @param res
   */
  public signin(req: Request, res: Response): void {
    const email: string = req.body.email;
    const password: string = req.body.password;

    validateUser(email, password).then((match) => {

      if (match) {
        console.log("valid password");
      } else {
        console.log("invalid password");
      }
    });
  }
}