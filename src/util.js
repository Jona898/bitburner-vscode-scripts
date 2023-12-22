// ================================================
//    Get all servers
// ================================================

/** @type {(ns: NS) => () => Set<string>} */
export const getAllServers = ((ns) => () => {
  /** @type { Set<string> } */
  const allServers = new Set()
  allServers.add("home")

  /** @type { (hostname: string)=>void } */
  const findAdjasentServers = (hostname) => {
    ns.scan(hostname)
      .forEach((server) => {
        if (!allServers.has(server)) {
          allServers.add(server)
          findAdjasentServers(server)
        }
      })
  }
  findAdjasentServers("home")

  return allServers
})



// ================================================
//    Hack hackable servers
// ================================================

const portCracks = [
  "BruteSSH.exe",// : "brutessh",
  "FTPCrack.exe",// : "ftpcrack",
  "relaySMTP.exe",// : "relaysmtp",
  "HTTPWorm.exe",// : "httpworm",
  "SQLInject.exe",// : "sqlinject"
]

/** @type {(ns: NS) => () => number} */
export const getCurrentPortCrackCount = (ns) => () => {
  let currentPortCracks = 0
  for (let crack of portCracks) {
    if (ns.fileExists(crack, "home")) {
      currentPortCracks++
    }
  }
  return currentPortCracks
}

/** @type { (ns: NS) => (hostname: string) => boolean } */
export const gainRootRights = (ns) => (hostname) => {
  if (!ns.hasRootAccess(hostname)) {
    // if (ns.getServerNumPortsRequired(hostname) <= currentPortCracks) {
    //   for (let crack in portCracks) {
    //     if (ns.fileExists(crack, "home")) {
    //       ns[portCracks[crack]](hostname)
    //     }
    //   }
    try {
      ns.brutessh(hostname)
      ns.ftpcrack(hostname)
      ns.relaysmtp(hostname)
      ns.httpworm(hostname)
      ns.sqlinject(hostname)
    } catch { }

    try {
      ns.nuke(hostname)
    } catch {
      return false
    }
  }

  /* Requires Singularity 4-1 */
  // if (!ns.getServer(hostname).backdoorInstalled) {
  //   try {
  //     await ns.singularity.installBackdoor(server);
  //   } catch {
  //   }
  // }

  return ns.hasRootAccess(hostname)
}






/** @param {NS} ns */
export async function main(ns) {
  ns.tprint([...getAllServers(ns)().keys()].sort().join("\n"))
}

