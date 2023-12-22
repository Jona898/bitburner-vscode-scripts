import {
  // getAllServers as util_getAllServers,
  // getCurrentPortCrackCount as util_getCurrentPortCrackCount,
  gainRootRights as util_gainRootRights,
} from "util.js"

/** @param {NS} ns */
export async function main(ns) {



  const target = ns.args[0]



  if (!target)
    throw ("TargetServer in Arg[0] not provided")

  if (!ns.serverExists(target))
    throw ("Target doesn't exist")

  ns.tprint(pathToServer(ns)(target))
}

//  /** @type { (ns: NS) => (target: string) => string } */
export const pathToServer = (ns) => (target) => {
  // /** @type { () => Set<string> } */
  // const getAllServers = util_getAllServers(ns)

  // /** @type { () => number } */
  // const getCurrentPortCrackCount = util_getCurrentPortCrackCount(ns)

  /** @type { (hostname: string) => boolean } */
  const gainRootRights = util_gainRootRights(ns)


  /** @type {Map<string,string>} */
  let checkedServers = new Map()

  checkedServers.set("home", "")
  ns.getPurchasedServers()
    .forEach(pserv => checkedServers.set(pserv, "home"))


  function searchAdjasentServers(hostname) {
    let foundServers = ns.scan(hostname)

    foundServers.forEach((server) => {
      if (!checkedServers.has(server)) {
        checkedServers.set(server, hostname)
        searchAdjasentServers(server)
      }
    })
  }


  /**
   * =======================================================
   * MAIN
   * =======================================================
   */

  searchAdjasentServers("home")

  /** @type { string[] } */
  let path = ["backdoor; analyze;"]

  let currServer = target

  while (checkedServers.has(currServer)) {
    if (currServer != "home") {
      path.push("connect " + currServer)
    } else {
      path.push("home")
    }
    currServer = checkedServers.get(currServer)
  }


  gainRootRights(target)

  return path
    .reverse()
    .join("; ")
}
