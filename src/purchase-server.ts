import { NS } from '@ns'


export async function main(ns: NS): Promise<void> {
    // How much RAM each purchased server will have. In this case, it'll
    // be 8GB.
    let ram = 2;
    const START_RAM_AFTER_CREATION = Math.pow(2, 3)

    // let scriptName = "early-hack-template.js"
    // let target = ns.args[0]

    // if (!ns.fileExists(scriptName, "home"))
    //   throw ("Script " + scriptName + " doesn't exist")

    // if (!target || target == "_")
    //   ns.tprint("TargetServer in Arg[0] not provided")
    // else
    //   if (!ns.getServerMaxMoney(target))
    //     throw ("Target doesn't exist")
    //   else
    //     ns.print("Max Money Target: " + ns.getServerMaxMoney(target))

    // let ramScript = ns.getScriptRam(scriptName, "home")

    ns.disableLog("sleep")
    ns.disableLog("purchaseServer")
    ns.disableLog("upgradePurchasedServer")
    ns.disableLog("getServerUsedRam")



    ns.print("ServerCost: " + ns.getPurchasedServerCost(ram))

    ns.tail()

    // Continuously try to purchase servers until we've reached the maximum
    // amount of servers
    while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
        // Check if we have enough money to purchase a server
        const hostname = ns.purchaseServer("pserv-" + ns.getPurchasedServers().length, ram);
        if (hostname) {
            // if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            // If we have enough money, then:
            //  1. Purchase the server
            //  2. Copy our hacking script onto the newly-purchased server
            //  3. Run our hacking script on the newly-purchased server with 3 threads
            // ns.scp(scriptName, hostname);
            // startScriptOnServer(hostname, ram)

            ns.print("Bought Server " + hostname + " with " + ns.formatRam(ram) + " for $" + ns.formatNumber(ns.getPurchasedServerCost(ram), 2))
            ns.toast("Bought Server " + hostname + " with " + ns.formatRam(ram) + " for $" + ns.formatNumber(ns.getPurchasedServerCost(ram), 2))
            await ns.sleep(500);
        } else {
            await ns.sleep(2000);
        }
    }


    const servers = ns.getPurchasedServers()
    let i = 0
    const MAX_RAM = ns.getPurchasedServerMaxRam()// 1_048_576// (2^20)

    let currentUpgradeCostServer = ns.getPurchasedServerCost(START_RAM_AFTER_CREATION) - ns.getPurchasedServerCost(ram)

    ram = START_RAM_AFTER_CREATION

    while (ns.getPurchasedServerCost(ram) < (ns.getServerMoneyAvailable("home") / 100)) {
        ram *= 2
    }

    ns.print(`Purchasing next ${ram}GB for ${currentUpgradeCostServer}`)

    function incrementServer() {
        if (++i >= servers.length) {
            currentUpgradeCostServer = ns.getPurchasedServerCost(ram * 2) - ns.getPurchasedServerCost(ram)
            i = 0
            ram *= 2
            if (ram > MAX_RAM) {
                ns.print(`Max Ram: ${MAX_RAM}`)
                throw ("All purchased servers are on max RAM")
            }
        }
    }

    while (ns.getServerMaxRam(servers[i]) >= ram) {
        incrementServer()
    }

    while (true) {

        const hostname = servers[i]

        // if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerUpgradeCost(hostname, ram)) {

        if (ns.upgradePurchasedServer(hostname, ram)) {

            ns.toast("Upgraded Server " + hostname + " to " + ns.formatRam(ram) + " RAM", "success", 4000)
            ns.print("Upgraded Server " + hostname + " to " + ns.formatRam(ram) + " for $" + ns.formatNumber(currentUpgradeCostServer, 2))

            // ns.scriptKill(scriptName, hostname)
            // let freeRam = ram - ns.getServerUsedRam(hostname)
            // startScriptOnServer(hostname, freeRam)

            incrementServer()


            await ns.sleep(500);
        } else {
            // ns.print("Need $" + ns.formatNumber(ns.getPurchasedServerUpgradeCost(hostname, ram), 2)
            //   + " to upgrade Server to " + ns.formatRam(ram))

            await ns.sleep(10000);
        }
    }
}