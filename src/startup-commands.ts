/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
    // getAllServers as util_getAllServers,
    // getCurrentPortCrackCount as util_getCurrentPortCrackCount,
    gainRootRights as util_gainRootRights,
} from "util.js"

// import {
//     pathToServer as pathToServer_pathToServer
// } from "path-to-server.js"



import { NS } from '@ns'


export async function main(ns: NS): Promise<void> {
    ns.tail()
    ns.disableLog("scan")

    // const getAllServers = util_getAllServers(ns)

    // const getCurrentPortCrackCount = util_getCurrentPortCrackCount(ns)

    const gainRootRights = util_gainRootRights(ns)

    // const pathToServer = pathToServer_pathToServer(ns)

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

    const outputStr: string[] = [""]

    outputStr.push(`home; connect darkweb; ${toBuy.map(elem => `buy ${elem}; `).join("")} buy -l; home; run startup-commands.js;`)


    if (ns.singularity.purchaseTor()) {
        // ns.singularity.getDarkwebPrograms()
        toBuy.forEach(programToBuy => {
            if (ns.singularity.purchaseProgram(programToBuy)) {
                ns.tprint(`==== Purchased Program ${programToBuy} ====`)
            }
        })
    }


    const checkedServers = new Map<string, string>()
    checkedServers.set("home", "")

    function searchAdjacentServers(hostnameSearch: string): void {
        const foundServers = ns.scan(hostnameSearch)

        for (const hostnameFound of foundServers) {
            if (!checkedServers.has(hostnameFound)) {
                checkedServers.set(hostnameFound, hostnameSearch)

                gainRootRights(hostnameSearch)

                searchAdjacentServers(hostnameFound)
            }
        }
    }

    async function backdoorServer(hostname: string): Promise<void> {
        let serverObject
        try {
            serverObject = ns.getServer(hostname);
        }
        catch { return }
        if (ns.hasRootAccess(hostname)
            && !serverObject.backdoorInstalled
            && serverObject.requiredHackingSkill! < ns.getHackingLevel()
            && !serverObject.purchasedByPlayer) {
            let connectServers = [];
            let currServer = hostname// checkedServers.get(hostname) || ""
            while (checkedServers.has(currServer)) {
                connectServers.push(currServer)

                currServer = checkedServers.get(currServer) || ""
            }
            connectServers = connectServers.reverse()

            // ns.tprint(`Connect to servers: ${connectServers}`)
            for (const connectToServer of connectServers) {
                ns.singularity.connect(connectToServer);
            }

            ns.tprint(`Installing backdoor on ${hostname}`)

            // await ns.singularity.installBackdoor();
            let pidStarted = 0
            do {
                pidStarted = ns.run("bin/installBackdoorHelper.js", 1, hostname)
                if (pidStarted == 0) {
                    await ns.sleep(1000)
                }
            } while (pidStarted == 0);

            await ns.asleep(50);

            // if (ns.getServer(hostname).backdoorInstalled) {
            //     ns.tprint(`Installing backdoor on ${hostname} worked`)
            // } else {
            //     ns.tprint(`Installing backdoor on ${hostname} DIDN'T work ${serverObject.requiredHackingSkill} < ${ns.getHackingLevel()}`)
            // }
        }
    }

    searchAdjacentServers("home")

    const backdoorTargets = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "The-Cave", "w0r1d_d43m0n"];
    for (const hostname of backdoorTargets) {
        try {
            await backdoorServer(hostname);

            const server = ns.getServer(hostname)
            if (!server.backdoorInstalled) {
                ns.tprint(`Server ${hostname} needs ${server.numOpenPortsRequired} ports and ${server.requiredHackingSkill} lvl`)
            }
        } catch {/* */ }
    }

    for (const hostname of checkedServers.keys()) {
        await backdoorServer(hostname);
    }

    ns.singularity.connect("home");



    // const tryGetPathToServer = (hostname: string) => {
    //     try {
    //         outputStr.push(hostname + "; " + pathToServer(hostname))
    //     } catch {
    //         // Ignore
    //     }
    // }

    // backdoorTargets.forEach(target => tryGetPathToServer(target))

    ns.tprint(outputStr.join("\n"))


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