import { Request, Response } from "express";
import { reserveItem, takeItem, getAllHardwareItems, addAllHardwareItems } from "../util/hardwareLibrary";
import { ApiError } from "../util/errorHandling/apiError";
import { HttpResponseCode } from "../util/errorHandling/httpResponseCode";
/**
 * A controller for handling hardware items
 */
export class HardwareController {

  /**
   * Reserves a item from the hardware library
   */
  public async reserve(req: Request, res: Response, next: Function): Promise<void> {
    // Check the requested item in req.body.item can be reserved
    // Using the hardware_item and reserved_hardware_item tables get the current reserved and taken
    // if (stock - (reserved + taken) > 0)
    // then the item can be reserved (reserve the item and return success (+ create qr))
    // otherwise, return that the item can't be reserved
    try {
      const token: string = await reserveItem(req.user, req.body.item);
      if (token) {
        res.send({
          "message": "Item reserved!",
          "token": token
        });
      } else {
        return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Item cannot be reserved!"));
      }
    } catch (err) {
      return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  }

  /**
   * Attempts to take the item from the hardware library
   */
  public async take(req: Request, res: Response, next: Function): Promise<void> {
    try {
      const takenItem: boolean  = await takeItem(req.body.token);
      if (takenItem !== undefined) {
        res.send({
          "message": takenItem ? "Item has been taken from the library" : "Item has been returned to the library"
        });
      } else {
        return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Action failed!"));
      }
    } catch (err) {
      return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  }

  /**
   * Gets all the items from the database
   */
  public async getAllItems(req: Request, res: Response, next: Function): Promise<void> {
    try {
      const allItems: Object[] = await getAllHardwareItems();
      if (allItems !== undefined) {
        res.send(allItems);
      } else {
        return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Action failed!"));
      }
    } catch (err) {
      return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  }

  /**
   * Adds all the items in the request to the database
   * Use the following format to add the items:
   * [{
   * "itemName": "...",
   * "itemURL": "...",
   * "itemDescription": "...",
   * "itemStock": 0
   * },
   * {
   * "itemName": "...",
   * "itemURL": "...",
   * "itemDescription": "...",
   * "itemStock": 0
   * }]
   */
  public async addAllItems(req: Request, res: Response, next: Function): Promise<void> {
    try {
      await addAllHardwareItems(req.body);
      res.send({"message": "Added all items"});
    } catch (err) {
      return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  }
}