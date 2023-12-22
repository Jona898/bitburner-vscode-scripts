/** @param {NS} ns */
export async  function main(ns) {

  ns.disableLog("ALL")

  let checkedServers = ns.getPurchasedServers()
  checkedServers.push("home")


  function getAllServers(hostname) {
    let foundServers = ns.scan(hostname)

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
    let hackingLevelTresh = ns.getHackingLevel() * 0.66

    // /** @type { { "hostname": string, hackingLevel: number, money: number }[] } */
    // let serverMoney = []

    // checkedServers.forEach(
    //   hostname => {
    //     if (ns.getServerRequiredHackingLevel(hostname) < hackingLevelTresh
    //       && ns.getServerMaxMoney(hostname) > 0) {
    //       serverMoney.push({
    //         hostname: hostname,
    //         hackingLevel: ns.getServerRequiredHackingLevel(hostname),
    //         money: ns.getServerMaxMoney(hostname),
    //         moneyAvailable: ns.getServerMoneyAvailable(hostname),
    //         growthFactor: ns.getServerGrowth(hostname),
    //         securityCurr: ns.getServerSecurityLevel(hostname),
    //         baseSecurityLevel: ns.getServerBaseSecurityLevel(hostname),
    //         minSecurityLevel: ns.getServerMinSecurityLevel(hostname),
    //         completeServer: ns.getServer(hostname),
    //       })
    //     }
    //   }
    // )

    // /** @type { { "hostname": string, hackingLevel: number, money: number }[] } */
    let serverMoney = checkedServers.map(hostname => ns.getServer(hostname))
      .filter(server =>
        server.requiredHackingSkill < hackingLevelTresh
        && server.moneyMax > 0)

    serverMoney.sort((a, b) => b.moneyMax - a.moneyMax)

    serverMoney.forEach(server =>
      ns.print(server.hostname
        + " lvl " + server.requiredHackingSkill + ": "
        + ns.formatNumber(server.moneyMax, 2, 1000, true)
        + " Growtime" + ns.getGrowTime(server.hostname)
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
