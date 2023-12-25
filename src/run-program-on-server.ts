import { NS } from '@ns'


export async function main(ns: NS): Promise<void> {

    const scriptName = "early-hack-template.js"
    const target = ns.args[0] as string

    if (!ns.fileExists(scriptName, "home"))
        throw ("Script " + scriptName + " doesn't exist")

    if (!target)
        throw ("TargetServer in Arg[0] not provided")

    if (!ns.getServerMaxMoney(target))
        throw ("Target doesn't exist")
    else
        ns.print("Max Money Target: " + ns.getServerMaxMoney(target))

    const ramScript = ns.getScriptRam(scriptName, "home")

    const checkedServers = ns.getPurchasedServers()
    checkedServers.push("home")




    const portCracks = {
        "BruteSSH.exe": ns.brutessh,
        "FTPCrack.exe": ns.ftpcrack,
        "relaySMTP.exe": ns.relaysmtp,
        "HTTPWorm.exe": ns.httpworm,
        "SQLInject.exe": ns.sqlinject
    }



    /**  @returns {number} current existing cracks */
    function getCurrentPortCrack() {
        let crackNumber = 0
        for (const crack in portCracks) {
            if (ns.fileExists(crack, "home")) {
                crackNumber++
            }
        }
        return crackNumber
    }

    const currentPortCracks = getCurrentPortCrack()
    ns.toast("currentPortCracks: " + currentPortCracks)



    function gainRootRights(hostname: string): boolean {
        if (ns.getServerNumPortsRequired(hostname) <= currentPortCracks) {
            for (const crack in portCracks) {
                if (ns.fileExists(crack, "home")) {
                    portCracks[crack as keyof typeof portCracks](hostname)
                }
            }
            ns.nuke(hostname)
            return true
        }
        else
            return false
    }



    /** @returns {boolean} gotRootAccess */
    function deployScriptOnServer(hostname: string): boolean {
        if (gainRootRights(hostname) || hostname == "home") {
            // ns.killall(hostname)
            // ns.scriptKill(scriptName, hostname)
            let numberOfTimes = Math.floor((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / ramScript)
            if (hostname == "home") {
                numberOfTimes = Math.floor((ns.getServerMaxRam(hostname) * 0.75 - ns.getServerUsedRam(hostname)) / ramScript)
                if (numberOfTimes < 1)
                    return false
            }
            else
                ns.scp(scriptName, hostname, "home")
            if (numberOfTimes > 0)
                ns.exec(scriptName, hostname, numberOfTimes, target)
            return true
        }
        else
            return false
    }



    function infestAdjacentServers(hostname: string) {
        const foundServers = ns.scan(hostname)

        foundServers.forEach((server) => {
            if (!checkedServers.includes(server)) {
                checkedServers.push(server)
                const scriptDeployed = deployScriptOnServer(server)
                if (scriptDeployed) {
                    infestAdjacentServers(server)
                }
            }
        })
    }

    function listMoneyHackableServers() {
        const hackingLevelThresh = ns.getHackingLevel() * 0.66

        const serverMoney: { "hostname": string, hackingLevel: number, money: number }[] = []

        checkedServers.forEach(
            hostname => {
                if (ns.getServerRequiredHackingLevel(hostname) < hackingLevelThresh
                    && ns.getServerMaxMoney(hostname) > 0) {
                    serverMoney.push({
                        hostname: hostname,
                        hackingLevel: ns.getServerRequiredHackingLevel(hostname),
                        money: ns.getServerMaxMoney(hostname)
                    })
                }
            }


        )

        serverMoney.sort((a, b) => b.money - a.money)

        serverMoney.forEach(server =>
            ns.print(server.hostname
                + " lvl " + server.hackingLevel + ": "
                + ns.formatNumber(server.money, 2, 1000, true)))
    }

    /**
     * =======================================================
     * MAIN
     * =======================================================
     */

    ns.tail()


    deployScriptOnServer("home")

    infestAdjacentServers("home")


    ns.getPurchasedServers().forEach((pserv) => {
        deployScriptOnServer(pserv)
    })



    listMoneyHackableServers()

}
