/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
    // getAllServers as util_getAllServers,
    // getCurrentPortCrackCount as util_getCurrentPortCrackCount,
    gainRootRights as util_gainRootRights,
} from "util.js"
import { NS } from '@ns'


export async function main(ns: NS): Promise<void> {



    const target = ns.args[0] as string



    if (!target)
        throw ("TargetServer in Arg[0] not provided")

    if (!ns.serverExists(target))
        throw ("Target doesn't exist")

    ns.tprint(pathToServer(ns)(target))
}

export const pathToServer = (ns: NS) => (target: string): string => {

    const gainRootRights = util_gainRootRights(ns)


    const checkedServers = new Map<string, string>()

    checkedServers.set("home", "")
    ns.getPurchasedServers()
        .forEach(pserv => checkedServers.set(pserv, "home"))


    function searchAdjacentServers(hostname: string) {
        const foundServers = ns.scan(hostname)

        foundServers.forEach((server) => {
            if (!checkedServers.has(server)) {
                checkedServers.set(server, hostname)
                searchAdjacentServers(server)
            }
        })
    }


    /**
     * =======================================================
     * MAIN
     * =======================================================
     */

    searchAdjacentServers("home")

    const path = ["backdoor; analyze;"]

    let currServer = target

    while (checkedServers.has(currServer)) {
        if (currServer != "home") {
            path.push("connect " + currServer)
        } else {
            path.push("home")
        }
        currServer = checkedServers.get(currServer)!
    }


    gainRootRights(target)

    return path
        .reverse()
        .join("; ")
}
