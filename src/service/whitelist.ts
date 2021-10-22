import WhiteList from "../utils/whitelist";

const isWhiteListed = async (
  serverId: string,
  address: string
): Promise<Boolean> => WhiteList.contains(serverId, address);

export { isWhiteListed };
