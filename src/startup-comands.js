
import {
  getAllServers as util_getAllServers,
  // getCurrentPortCrackCount as util_getCurrentPortCrackCount,
  gainRootRights as util_gainRootRights,
} from "util.js"

import {
  pathToServer as pathToServer_pathToServer
} from "path-to-server.js"



/** @param {NS} ns */
export async function main(ns) {

  /** @type { () => Set<string> } */
  const getAllServers = util_getAllServers(ns)

  // /** @type { () => number } */
  // const getCurrentPortCrackCount = util_getCurrentPortCrackCount(ns)

  /** @type { (hostname: string) => boolean } */
  const gainRootRights = util_gainRootRights(ns)


  //  /** @type { (ns: NS) => (target: string) => void } */
  const pathToServer = pathToServer_pathToServer(ns)

  const toBuy = [
    "BruteSSH.exe",
    "FTPCrack.exe",
    "relaySMTP.exe",
    "HTTPWorm.exe",
    "SQLInject.exe",
    // "ServerProfiler.exe",
    // "DeepscanV1.exe",
    // "DeepscanV2.exe",
    // "AutoLink.exe",
    // "Formulas.exe"
  ]

  /** @type { string[] } */
  let outrutStr = [""]

  outrutStr.push(`home; connect darkweb; ${toBuy.map(elem => `buy ${elem}; `).join("")} buy -l; home; run startup-comands.js;`)



  // getAllServers()
  //   .forEach(hostname => {
  //     gainRootRights(hostname)
  //   })
  for (let hostname of getAllServers().keys()) {
    gainRootRights(hostname)
    // if (ns.hasRootAccess(hostname) && !ns.getServer(hostname).backdoorInstalled) {
    //   try {
    //     ns.tprint(`Try instaling backdoor ${hostname}`)
    //     await ns.singularity.installBackdoor(server);
    //     ns.tprint(`worked`)
    //   } catch {
    //     ns.tprint(`Didn't work`)
    //   }
    // }
  }

  let backdoorTargets = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "The-Cave", "w0r1d_d43m0n"];

  let tryGetPathToServer = (hostname) => {
    try {
      outrutStr.push(hostname + "; " + pathToServer(hostname))
    } catch { }
  }

  backdoorTargets.forEach(target => tryGetPathToServer(target))

  ns.tprint(outrutStr.join("\n"))


  // early-hack-template.js
  // get-server-money.js
  // hacknet.js
  // infiltration.js
  // path-to-server.js
  // purchase-server.js
  // ratio-attack.js
  // run-program-on-server.js
  // share-with-faction.js

}