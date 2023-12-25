/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NS } from '@ns'


export async function main(ns: NS): Promise<void> {

    ns.disableLog("ALL")

    const checkedServers = ns.getPurchasedServers()
    checkedServers.push("home")


    function getAllServers(hostname: string) {
        const foundServers = ns.scan(hostname)

        foundServers.forEach((server) => {
            if (!checkedServers.includes(server)) {
                // if (ns.hasRootAccess(server)) {
                checkedServers.push(server)
                getAllServers(server)
                // }
            }
        })
    }

    function listMoneyHackableServers() {
        const hackingLevelThresh = ns.getHackingLevel() * 0.66

        const serverMoney = checkedServers.map(hostname => ns.getServer(hostname))
            .filter(server =>
                server.requiredHackingSkill! < hackingLevelThresh
                && server.moneyMax! > 0)

        serverMoney.sort((a, b) => b.moneyMax! - a.moneyMax!)

        serverMoney.forEach(server =>
            ns.print(server.hostname
                + " lvl " + server.requiredHackingSkill + ": "
                + ns.formatNumber(server.moneyMax!, 2, 1000, true)
                + " GrowTime" + ns.getGrowTime(server.hostname)
                + " HackTime" + ns.getHackTime(server.hostname)
                + " WeakenTime" + ns.getWeakenTime(server.hostname)
                + ns.getServerSecurityLevel(server.hostname)
                + ns.getServerBaseSecurityLevel(server.hostname)
                + ns.getServerMinSecurityLevel(server.hostname)
            ))


    }

    /**
     * =======================================================
     * MAIN
     * =======================================================
     */

    ns.tail()


    getAllServers("home")


    listMoneyHackableServers()

}
