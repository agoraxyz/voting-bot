/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

import JSONdb from "simple-json-db";
import { Poll } from "../types";

export default class DB {
  private static _db: JSONdb;

  private static _id: number;

  static init = () => {
    this._db = new JSONdb("db.json");
    const idObj = this._db.get("id");
    this._id = Number(idObj ? (idObj as any).value : 0);
    this._db.set("id", { value: this._id.toString() });
  };

  static get = (key: string): Poll => this._db.get(key) as Poll;

  static set = (key: Number, value: Poll) => {
    this._db.set(`${key}`, value);
    this._db.sync();
  };

  static add = (value: Poll) => {
    this.set(this._id, value);
    this._id += 1;
    this._db.set("id", { value: this._id.toString() });
  };

  static delete = (key: string) => {
    this._db.delete(key);
    this._db.sync();
  };

  static lastId = (): number => this._id;
}
