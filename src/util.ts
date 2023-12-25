import { NS } from '@ns'

// ================================================
//    Get all servers
// ================================================

export const getAllServers = ((ns: NS) => (): Set<string> => {
    const allServers = new Set<string>()
    allServers.add("home")

    const findAdjasentServers = (hostname: string): void => {
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


export const getCurrentPortCrackCount = (ns: NS) => (): number => {
    let currentPortCracks = 0
    for (const crack of portCracks) {
        if (ns.fileExists(crack, "home")) {
            currentPortCracks++
        }
    }
    return currentPortCracks
}


export const gainRootRights = (ns: NS) => (hostname: string): boolean => {
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
        } catch {
            // Nothing to do here
        }

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








export async function main(ns: NS): Promise<void> {
    ns.tprint([...getAllServers(ns)().keys()].sort().join("\n"))
}

