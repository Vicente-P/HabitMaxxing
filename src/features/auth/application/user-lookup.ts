/** Port: lookup of user accounts by id. */
export interface UserLookup {
  exists(userId: string): Promise<boolean>;
}
