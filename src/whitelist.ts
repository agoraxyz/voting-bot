/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

import JSONdb from "simple-json-db";

export default class Whitelist {
  private static _db: JSONdb;

  static init() {
    this._db = new JSONdb("whitelist.json");
  }

  static add(serverId: string, addresses: string[]) {
    const addrsInDb = this._db.get(serverId) as string[];

    let addrs = [...new Set(addresses.concat(addrsInDb ? addrsInDb : []))];

    this._db.set(serverId, addrs);
    this._db.sync();
  }

  static delete(serverId: string, addresses: string[]) {
    this._db.set(
      serverId,
      (this._db.get(serverId) as string[]).filter(
        (address) => !addresses.includes(address)
      )
    );
    this._db.sync();
  }
}
