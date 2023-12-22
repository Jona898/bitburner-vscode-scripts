/** @param {NS} ns */
export  async function main(ns) {

  let scriptName = "early-hack-template.js"
  let target = ns.args[0]

  if (!ns.fileExists(scriptName, "home"))
    throw ("Script " + scriptName + " doesn't exist")

  if (!target)
    throw ("TargetServer in Arg[0] not provided")

  if (!ns.getServerMaxMoney(target))
    throw ("Target doesn't exist")
  else
    ns.print("Max Money Target: " + ns.getServerMaxMoney(target))

  let ramScript = ns.getScriptRam(scriptName, "home")

  let checkedServers = ns.getPurchasedServers()
  checkedServers.push("home")




  let portCracks = {
    "BruteSSH.exe": ns.brutessh,
    "FTPCrack.exe": ns.ftpcrack,
    "relaySMTP.exe": ns.relaysmtp,
    "HTTPWorm.exe": ns.httpworm,
    "SQLInject.exe": ns.sqlinject
  }



  /**  @returns {number} current existeng cracks */
  function getCurrentPortCrack() {
    let crackNumber = 0
    for (let crack in portCracks) {
      if (ns.fileExists(crack, "home")) {
        crackNumber++
      }
    }
    return crackNumber
  }

  let currentPortCracks = getCurrentPortCrack()
  ns.toast("currentPortCracks: " + currentPortCracks)



  /** @param {string} hostname
   *  @returns {boolean} gotRootAccess */
  function gainRootRights(hostname) {
    if (ns.getServerNumPortsRequired(hostname) <= currentPortCracks) {
      for (let crack in portCracks) {
        if (ns.fileExists(crack, "home")) {
          portCracks[crack](hostname)
        }
      }
      ns.nuke(hostname)
      return true
    }
    else
      return false
  }



  /** @param {string} hostname
   *  @returns {boolean} gotRootAccess */
  function deployScriptOnServer(hostname) {
    if (gainRootRights(hostname) || hostname == "home") {
      // ns.killall(hostname)
      // ns.scriptKill(scriptName, hostname)
      let numberoftimes = Math.floor((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / ramScript)
      if (hostname == "home") {
        numberoftimes = Math.floor((ns.getServerMaxRam(hostname) * 0.75 - ns.getServerUsedRam(hostname)) / ramScript)
        if (numberoftimes < 1)
          return false
      }
      else
        ns.scp(scriptName, hostname, "home")
      if (numberoftimes > 0)
        ns.exec(scriptName, hostname, numberoftimes, target)
      return true
    }
    else
      return false
  }



  function infestAdjasentServers(hostname) {
    let foundServers = ns.scan(hostname)

    foundServers.forEach((server) => {
      if (!checkedServers.includes(server)) {
        checkedServers.push(server)
        let scriptDeployed = deployScriptOnServer(server)
        if (scriptDeployed) {
          infestAdjasentServers(server)
        }
      }
    })
  }

  function listMoneyHackableServers() {
    let hackingLevelTresh = ns.getHackingLevel() * 0.66

    /** @type { { "hostname": string, hackingLevel: number, money: number }[] } */
    let serverMoney = []

    checkedServers.forEach(
      hostname => {
        if (ns.getServerRequiredHackingLevel(hostname) < hackingLevelTresh
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

  infestAdjasentServers("home")


  ns.getPurchasedServers().forEach((pserv) => {
    deployScriptOnServer(pserv)
  })



  listMoneyHackableServers()

}
