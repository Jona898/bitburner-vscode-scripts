import { NS } from '@ns'


export async function main(ns: NS): Promise<void> {

    ns.disableLog("ALL")

    ns.tprint("   run ratio-attack.js --uh --sr --mu 20    ")

    /** @type { { uh:boolean, sr:boolean, mu:number } } */
    const dataFlags = ns.flags([
        ['uh', true],
        ['sr', true],
        ['mu', 2]
    ]);
    ns.tprint(dataFlags);


    const RAM_LEAVE_FREE_HOME = 64

    const EXTRA_WEAKEN_THREADS = 1.5
    const EXTRA_GROW_THREADS = 2

    const WEAKEN_PER_THREAD = 0.05 / EXTRA_WEAKEN_THREADS // ns.weakenAnalyze(1, 1)
    const GROWTH_SECURITY_INCREASE_THREAD = 0.004// ns.growthAnalyzeSecurity(1, 'n00dles', 1)
    const HACK_SECURITY_INCREASE_THREAD = 0.002// ns.hackAnalyzeSecurity(1, 'n00dles')

    const MULTIPLIER_MONEY = dataFlags.mu as number > 1.05 ? dataFlags.mu as number : 2
    const HACK_PERCENT = ((MULTIPLIER_MONEY - 1) / MULTIPLIER_MONEY)

    ns.tprint(`Multiplier: ${MULTIPLIER_MONEY}, PartToHack: ${HACK_PERCENT}`)

    // ================================================
    //    Create Hack scripts
    // ================================================

    type scriptValueType = { filename: string, algorithm: string, isLoop: boolean, needsTime: (host: string) => number, scriptRam: number }

    const scripts: {
        "growLoop": scriptValueType,
        "weakLoop": scriptValueType,
        "hackLoop": scriptValueType,
        "growOnce": scriptValueType,
        "weakOnce": scriptValueType,
        "hackOnce": scriptValueType,
    } = {
        /** @summary  Script to grow money on Server  
         * arg[0] target  
         * arg[1] id  
         * arg[2] waitMs before start */
        "growLoop": { filename: "bin/z_growLoop.js", algorithm: "ns.grow", isLoop: true, needsTime: ns.getGrowTime, scriptRam: 2 },
        /** @summary  Script to weaken security on Server  
        * arg[0] target  
        * arg[1] id  
        * arg[2] waitMs before start */
        "weakLoop": { filename: "bin/z_weakLoop.js", algorithm: "ns.weaken", isLoop: true, needsTime: ns.getWeakenTime, scriptRam: 2 },
        /** @summary  Script to extract money from Server  
         * arg[0] target  
         * arg[1] id  
         * arg[2] waitMs before start */
        "hackLoop": { filename: "bin/z_hackLoop.js", algorithm: "ns.hack", isLoop: true, needsTime: ns.getHackTime, scriptRam: 2 },
        /** @summary  Script to grow money on Server  
        * arg[0] target  
        * arg[1] id  
        * arg[2] waitMs before start */
        "growOnce": { filename: "bin/z_growOnce.js", algorithm: "ns.grow", isLoop: false, needsTime: ns.getGrowTime, scriptRam: 2 },
        /** @summary  Script to weaken security on Server  
        * arg[0] target  
        * arg[1] id  
        * arg[2] waitMs before start */
        "weakOnce": { filename: "bin/z_weakOnce.js", algorithm: "ns.weaken", isLoop: false, needsTime: ns.getWeakenTime, scriptRam: 2 },
        /** @summary  Script to extract money from Server  
         * arg[0] target  
         * arg[1] id  
         * arg[2] waitMs before start */
        "hackOnce": { filename: "bin/z_hackOnce.js", algorithm: "ns.hack", isLoop: false, needsTime: ns.getHackTime, scriptRam: 2 }
    }


    function getScriptBody(type: keyof typeof scripts) {
        return `export async function main(ns) {
  if (typeof ns.args[2] == "number" && ns.args[2] > 0)
    ns.print("wait for " + ns.args[2] / 1000 + "s");
    await ns.sleep(ns.args[2]);
  do {
    await ${scripts[type].algorithm}(ns.args[0]);
  } while(${scripts[type].isLoop})
}`
    }


    //'export async function main(ns) { if (typeof ns.args[2] == "number" && ns.args[2] > 0) await ns.sleep(ns.args[2]); while (true) { await ns.grow(ns.args[0]); } }'
    ns.write(scripts.growLoop.filename, getScriptBody("growLoop"), 'w');
    //'export async function main(ns) { if (typeof ns.args[2] == "number" && ns.args[2] > 0) await ns.sleep(ns.args[2]); while (true) { await ns.weaken(ns.args[0]); } }'
    ns.write(scripts.weakLoop.filename, getScriptBody("weakLoop"), 'w');
    //'export async function main(ns) { if (typeof ns.args[2] == "number" && ns.args[2] > 0) await ns.sleep(ns.args[2]); while (true) { await ns.hack(ns.args[0]); } }'
    ns.write(scripts.hackLoop.filename, getScriptBody("hackLoop"), 'w');

    //'export async function main(ns) { if (typeof ns.args[2] == "number" && ns.args[2] > 0) await ns.sleep(ns.args[2]); /*while (true)*/ { await ns.grow(ns.args[0]); } }'
    ns.write(scripts.growOnce.filename, getScriptBody("growOnce"), 'w');
    //'export async function main(ns) { if (typeof ns.args[2] == "number" && ns.args[2] > 0) await ns.sleep(ns.args[2]); /*while (true)*/ { await ns.weaken(ns.args[0]); } }'
    ns.write(scripts.weakOnce.filename, getScriptBody("weakOnce"), 'w');
    //'export async function main(ns) { if (typeof ns.args[2] == "number" && ns.args[2] > 0) await ns.sleep(ns.args[2]); /*while (true)*/ { await ns.hack(ns.args[0]); } }'
    ns.write(scripts.hackOnce.filename, getScriptBody("hackOnce"), 'w');

    for (const type in scripts) {
        scripts[type as keyof typeof scripts].scriptRam = ns.getScriptRam(scripts[type as keyof typeof scripts].filename)
    }
    const maxScriptRam = Math.max(
        scripts.growLoop.scriptRam,
        scripts.hackLoop.scriptRam,
        scripts.weakLoop.scriptRam
    )




    // ================================================
    //    Get all servers
    // ================================================

    const allServers = new Set<string>()

    function getAllServers() {
        allServers.add("home")
        const findAdjacentServers = (hostname: string) => {
            ns.scan(hostname)
                .forEach((server) => {
                    if (!allServers.has(server)) {
                        allServers.add(server)
                        findAdjacentServers(server)
                    }
                })
        }
        findAdjacentServers("home")
    }




    // ================================================
    //    Stop running Processes
    // ================================================
    const scriptsToKill = [
        "early-hack-template.js",
        "bin/z_growLoop.js",
        "bin/z_weakLoop.js",
        "bin/z_hackLoop.js",
        "bin/z_growOnce.js",
        "bin/z_weakOnce.js",
        "bin/z_hackOnce.js"
    ]

    function stopRunningProcesses() {
        for (const hostname of allServers) {
            scriptsToKill.forEach(script => ns.scriptKill(script, hostname))
        }
    }





    // ================================================
    //    Hack hackable servers
    // ================================================

    const portCracks = {
        "BruteSSH.exe": ns.brutessh,
        "FTPCrack.exe": ns.ftpcrack,
        "relaySMTP.exe": ns.relaysmtp,
        "HTTPWorm.exe": ns.httpworm,
        "SQLInject.exe": ns.sqlinject
    }

    let currentPortCracks = 0
    let portCracksLastRun = -1
    function updateCurrentPortCrack() {
        currentPortCracks = 0
        for (const crack in portCracks) {
            if (ns.fileExists(crack, "home")) {
                currentPortCracks++
            }
        }
    }

    function gainRootRights(hostname: string): boolean {
        if (ns.hasRootAccess(hostname))
            return true
        if (ns.getServerNumPortsRequired(hostname) <= currentPortCracks) {
            for (const crack in portCracks) {
                if (ns.fileExists(crack, "home")) {
                    portCracks[crack as keyof typeof portCracks](hostname)
                }
            }
            ns.nuke(hostname)
            return true
        }
        return false
    }

    let hackedServers: string[] = []
    function hackAllServers() {
        updateCurrentPortCrack()

        if (portCracksLastRun < currentPortCracks) {
            ns.print("Started hacking all Servers")
            portCracksLastRun = currentPortCracks
            hackedServers = []
            allServers.forEach(server => {
                if (gainRootRights(server) && server != "home")
                    hackedServers.push(server)
            })

        }
    }


    // ================================================
    //    Get attack Servers
    // ================================================

    let attackers: string[] = []
    function updateAttackServers() {
        attackers = hackedServers
            .filter(server => ns.hasRootAccess(server) && ns.getServerMaxRam(server) > 0)
            .sort((a, b) => ns.getServerMaxRam(b) - ns.getServerMaxRam(a))

        ns.print(`Attackers: ${attackers.join(", ")}`)

        attackers.forEach(attacker =>
            ns.scp(Object.values(scripts).map(script => script.filename), attacker)
        )

        attackers.push("home")
    }



    // ================================================
    //    Get target Servers
    // ================================================


    const targets = new Map<string, ServerForHackingInfo>()
    const weakeningTargets_Set = new Set<string>()
    const weakenedTargets: string[] = []

    function formatTime(millisecond: number): string {
        // const secTot = millisecond / 1000
        // const min = Math.floor(secTot / 60)
        // const sec=Math.ceil(secTot - min * 60)
        return `${(millisecond / 60_000).toFixed(2)}m`
    }

    function updateAllTargets() {
        const hackingLevelThresh = Math.max(ns.getHackingLevel() * 0.6, 1)

        // for (let hostname of hackedServers) {
        //   const server = ns.getServer(hostname)
        //   if (server.requiredHackingSkill < hackingLevelThresh
        //     && server.moneyMax > 0)
        //     targets.push(hostname)
        // }


        hackedServers
            .filter(hostname => {
                return (ns.getServerRequiredHackingLevel(hostname) < hackingLevelThresh
                    || ns.getServerRequiredHackingLevel(hostname) == 1)
                    && ns.getServerMaxMoney(hostname) > 0
            })
            .forEach(hostname => {
                if (!targets.has(hostname)) {
                    targets.set(hostname, getServerForHacking(hostname))
                }
            })

        // ns.print(`hackedServers in Func ${hackedServers.join(" ")}`)
        // ns.print(`Targets in Func ${Object.keys(targets).join(" ")}`)

        // targets.sort((a, b) => ns.getServerMaxMoney(b) - ns.getServerMaxMoney(a))

        // for (const target of targets) {
        //   if (!weakeningTargets_Set.has(target) && !weakenedTargets.has(target)) {
        //     if (!weakenTarget(target)) {
        //       break // no free ram
        //     }
        //   }
        // }

        // targets.forEach(hostname => {
        //   const server = ns.getServer(hostname)
        //   ns.print(server.hostname.padEnd(18)
        //     + " " + String(server.requiredHackingSkill).padStart(4)
        //     + ": \$" + ns.formatNumber(server.moneyAvailable, 1).padStart(6)
        //     + " / \$" + ns.formatNumber(server.moneyMax, 1).padStart(6)
        //     + " Gt-" + formatTime(ns.getGrowTime(server.hostname)).padStart(6)
        //     + " Ht-" + formatTime(ns.getHackTime(server.hostname)).padStart(6)
        //     + " Wt-" + formatTime(ns.getWeakenTime(server.hostname)).padStart(6)
        //     + " " + ns.getServerGrowth(server.hostname).toFixed(0).padStart(3)
        //     + "% " + (ns.getServerSecurityLevel(server.hostname).toFixed(0).padStart(2))
        //     + " " + (ns.getServerBaseSecurityLevel(server.hostname).toFixed(0).padStart(2))
        //     + " " + (ns.getServerMinSecurityLevel(server.hostname).toFixed(0).padStart(2))
        //   )
        // })

    }



    // const TEMP_PROCESS = "TEMP"
    // const UNDEFINED_TARGET_PROCESS = "UNDEFINED"

    // /** @type { { [key:string]: (ProcessInfo & {hostname:string})[] } } */
    // let growCurrProcess = {}
    // /** @type { { [key:string]: (ProcessInfo & {hostname:string})[] } } */
    // let weakCurrProcess = {}
    // /** @type { { [key:string]: (ProcessInfo & {hostname:string})[] } } */
    // let hackCurrProcess = {}

    // function updateRunningProcesses() {
    //   for (let hostname of attackers) {
    //     for (let process of ns.ps(hostname)) {
    //       /** @type { { [key:string]: (ProcessInfo & {hostname:string})[] } } */
    //       let addArray
    //       switch (process.filename) {
    //         case scripts.growLoop:
    //           addArray = growCurrProcess
    //           break

    //         case scripts.weakLoop:
    //           addArray = weakCurrProcess
    //           break

    //         case scripts.hackLoop:
    //           addArray = hackCurrProcess
    //           break

    //         default:
    //           continue
    //       }
    //       process.hostname = hostname
    //       /** @type { string } */
    //       let target = process.args[0]
    //       if (!target) target = UNDEFINED_TARGET_PROCESS
    //       if (!Object.keys(addArray).includes(target))
    //         addArray[target] = []
    //       addArray[target].push(process)
    //     }
    //   }

    //   ns.tprint("========= Grow =========")
    //   for (let target in growCurrProcess) {
    //     for (let process of growCurrProcess[target])
    //       ns.tprint(`${target}: ${process.hostname} ${process.filename} ${process.threads} ${process.pid}`)
    //   }

    //   ns.tprint("========= Weak =========")
    //   for (let target in weakCurrProcess) {
    //     for (let process of growCurrProcess[target])
    //       ns.tprint(`${target}: ${process.hostname} ${process.filename} ${process.threads} ${process.pid}`)
    //   }

    //   ns.tprint("========= Hack =========")
    //   for (let target in hackCurrProcess) {
    //     for (let process of growCurrProcess[target])
    //       ns.tprint(`${target}: ${process.hostname} ${process.filename} ${process.threads} ${process.pid}`)
    //   }

    // }


    function getBestTargets(bestElementCount = 15) {
        // @todo edit this part
        for (const server of targets.values()) {
            calculateServerValue(server)
        }


        const returnVal = [...targets.values()]
            .sort((a, b) => b.calculatedServerValue - a.calculatedServerValue)
            .slice(0, bestElementCount)



        return returnVal
    }


    function printServerStatus(server: ServerForHackingInfo) {

        ns.tprint(server.hostname.padEnd(18)
            + " " + String(server.requiredHackingLevel).padStart(4)
            + " SVal-" + server.calculatedServerValue.toFixed(3).padStart(7)
            + ": " + ns.formatNumber(ns.getServerMoneyAvailable(server.hostname), 1).padStart(6)
            + "$ / " + ns.formatNumber(server.maxMoney, 1).padStart(6)
            + "$ Wt-" + formatTime(server.weakenTime()).padStart(6)
            + " " + server.weakenThreads.toFixed(0).padEnd(4)
            + " Gt-" + formatTime(server.growTime()).padStart(6)
            + " " + server.growthThreads.toFixed(0).padEnd(4)
            + " Ht-" + formatTime(server.hackTime()).padStart(6)
            + " " + server.hackThreads.toFixed(0).padEnd(4)
            + " " + ns.getServerGrowth(server.hostname).toFixed(0).padStart(3)
            + "% " + (ns.getServerSecurityLevel(server.hostname).toFixed(0).padStart(2))
            + " " + (ns.getServerBaseSecurityLevel(server.hostname).toFixed(0).padStart(2))
            + " " + (ns.getServerMinSecurityLevel(server.hostname).toFixed(0).padStart(2))
        )
    }



    function calculateServerValue(server: ServerForHackingInfo) {
        const hackingLevelThresh = ns.getHackingLevel() * 0.6
        if (server.requiredHackingLevel < hackingLevelThresh) {
            server.calculatedServerValue =
                server.maxMoney / (
                    server.weakenThreads * server.weakenTime()
                    + server.growthThreads * server.growTime()
                    + server.hackThreads * server.hackTime()
                )
        }
    }

    interface ServerForHackingInfo {
        hostname: string;
        requiredHackingLevel: number;
        maxMoney: number;
        weakenTime: () => number;
        growTime: () => number;
        hackTime: () => number;
        hackPercentOneThread: number;
        weakenThreads: number;
        growthThreads: number;
        hackThreads: number;
        calculatedServerValue: number;
    }


    function getServerForHacking(hostname: string): ServerForHackingInfo {
        const target: ServerForHackingInfo = {
            hostname,

            requiredHackingLevel: ns.getServerRequiredHackingLevel(hostname),

            // moneyAvailable: ns.getServerMoneyAvailable(hostname),
            maxMoney: ns.getServerMaxMoney(hostname),

            // securityLevel_Curr: ns.getServerSecurityLevel(hostname),
            // securityLevel_Base: ns.getServerBaseSecurityLevel(hostname),
            // securityLevel_Min: ns.getServerMinSecurityLevel(hostname),
            // getServerGrowth: ns.getServerGrowth(hostname),
            // hackChance: ns.hackAnalyzeChance(hostname),

            weakenTime: () => ns.getWeakenTime(hostname),
            growTime: () => ns.getGrowTime(hostname),
            hackTime: () => ns.getHackTime(hostname),

            hackPercentOneThread: ns.hackAnalyze(hostname),
            weakenThreads: 0,
            growthThreads: Math.floor(ns.growthAnalyze(hostname, MULTIPLIER_MONEY, 1) * EXTRA_GROW_THREADS),
            hackThreads: 0,

            calculatedServerValue: 0,
        }
        if (target.growthThreads < 1) target.growthThreads = 1

        target.hackThreads = Math.floor(HACK_PERCENT / (target.hackPercentOneThread))
        if (target.hackThreads < 1) target.hackThreads = 1

        target.weakenThreads = Math.ceil(
            (target.growthThreads * GROWTH_SECURITY_INCREASE_THREAD
                + target.hackThreads * HACK_SECURITY_INCREASE_THREAD)
            / WEAKEN_PER_THREAD
        )
        if (target.weakenThreads < 1) target.weakenThreads = 1


        // ns.tprint(`w${target.weakenThreads} g${target.growthThreads} h${target.hackThreads}`)

        return target
    }



    function prepareTargetForHack(target: string): boolean {
        ns.print(`Prepare Target ${target}`)

        if (weakeningTargets_Set.has(target)) {
            // ns.print(`Weaken ${target} already in Progress`)
            return true
        }

        // ns.print(`Weaken target: ${target}`)

        const multiplier = ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target)
        const growthThreads = multiplier > 1
            ? multiplier < Infinity
                ? Math.ceil(ns.growthAnalyze(target, multiplier, 1) * 1.1)
                : 500000
            : 0
        const additionalSecurityGrowth = Math.ceil(ns.growthAnalyzeSecurity(growthThreads, target, 1))
        const weakenAmount1Thread = ns.weakenAnalyze(1, 1)
        const weakenThreadsToMin = Math.ceil((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)) / weakenAmount1Thread)
        const weakenThreadsForGrowth = Math.ceil((additionalSecurityGrowth * 1.1) / weakenAmount1Thread)


        let weakenStarted = startProcessOnFreeMemory("weakOnce", target, 0, weakenThreadsToMin) == 0

        const multiplierPartProcesses = Math.min(getTotalFreeRam() / (growthThreads * scripts.growLoop.scriptRam + weakenThreadsForGrowth * scripts.weakLoop.scriptRam), 1)

        const growStarted = startProcessOnFreeMemory("growOnce", target, 0, Math.ceil(growthThreads * multiplierPartProcesses)) == 0
        weakenStarted &&= startProcessOnFreeMemory("weakOnce", target, 0, Math.ceil(weakenThreadsForGrowth * multiplierPartProcesses)) == 0

        if (weakenStarted && growStarted && (growthThreads > 3 || weakenThreadsToMin > 3)) {
            weakeningTargets_Set.add(target)
            ns.asleep(Math.max(ns.getGrowTime(target), ns.getWeakenTime(target)) + 100)
                .then(() => {
                    weakeningTargets_Set.delete(target)
                    weakenedTargets.push(target)
                }, () => { /* */ })
            return true
        }
        else
            return false

    }






    function ratioAttack(target: ServerForHackingInfo, percentUseRam: number) {
        if (0 >= percentUseRam || percentUseRam > 1) throw "Percent use Ram has to be between 0 and 1"

        const ramToUse = getTotalFreeRam() * percentUseRam

        let totalWeakenThreads = target.weakenThreads * target.weakenTime() * 0.001
        let totalGrowthThreads = target.growthThreads * target.growTime() * 0.001
        let totalHackThreads = target.hackThreads * target.hackTime() * 0.001

        const ramOneRatio = totalWeakenThreads * scripts.weakLoop.scriptRam
            + totalGrowthThreads * scripts.growLoop.scriptRam
            + totalHackThreads * scripts.hackLoop.scriptRam

        const timesUseAttack = ramToUse / ramOneRatio

        totalWeakenThreads *= timesUseAttack
        totalGrowthThreads *= timesUseAttack
        totalHackThreads *= timesUseAttack

        const totalUsedRam = totalWeakenThreads * scripts.weakLoop.scriptRam
            + totalGrowthThreads * scripts.growLoop.scriptRam
            + totalHackThreads * scripts.hackLoop.scriptRam

        const alert_str = `${target.hostname}: Use ${ns.formatRam(ramToUse, 1)}/${ns.formatRam(totalUsedRam, 1)} with ${totalWeakenThreads / target.weakenThreads}x ${Math.floor(totalWeakenThreads)}w, ${Math.floor(totalGrowthThreads)}g, ${Math.floor(totalHackThreads)}h`
        ns.tprint(alert_str)
        ns.print(alert_str)

        const growWaitBeforeStartFirst = Math.max(50, target.weakenTime() - target.growTime() + 50)
        const hackWaitBeforeStartFirst = Math.max(100, growWaitBeforeStartFirst + target.growTime() - target.hackTime() + 50, target.weakenTime() - target.hackTime() + 100)

        startProcessOnFreeMemory("weakLoop", target.hostname, Math.max(Math.floor(totalWeakenThreads), 1), 0, target.weakenThreads)
        startProcessOnFreeMemory("growLoop", target.hostname, Math.max(Math.floor(totalGrowthThreads), 1), growWaitBeforeStartFirst, target.growthThreads)
        startProcessOnFreeMemory("hackLoop", target.hostname, Math.max(Math.floor(totalHackThreads), 1), hackWaitBeforeStartFirst, target.hackThreads)


    }


    function getTotalFreeRam() {
        let totalRam = 0

        attackers.forEach(attacker => {
            if (attacker != "home")
                totalRam += ns.getServerMaxRam(attacker) - ns.getServerUsedRam(attacker)
            else if (dataFlags.uh)
                totalRam += Math.max(ns.getServerMaxRam(attacker) - ns.getServerUsedRam(attacker) - RAM_LEAVE_FREE_HOME, 0)

        })

        return totalRam
    }


    let processId = 1

    function startProcessOnFreeMemory(type: keyof typeof scripts, target: string, totalThreadCount: number, additionalWaitTime = 0, batchThreadCount = Infinity): number {
        let threadCountToDeploy = totalThreadCount
        // if (_threadCount == 0) _threadCount = 1

        const batchCount = Math.ceil(Math.max(totalThreadCount, 1) / batchThreadCount)
        const ScriptDelayPerThread = scripts[type].needsTime(target) / totalThreadCount;
        const delay = batchCount > 1 ? ScriptDelayPerThread / batchCount : 0

        const scriptRam = ns.getScriptRam(scripts[type].filename)
        for (const server of attackers) {
            let maxThreads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / scriptRam)
            // Leave 64 GB free on home
            if (server == "home") maxThreads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server) - (RAM_LEAVE_FREE_HOME / 2)) / scriptRam)


            while (maxThreads > 0) {
                if (threadCountToDeploy <= 0) return 0
                const deployed = Math.min(threadCountToDeploy, maxThreads, batchThreadCount)
                const constDelayThread = additionalWaitTime
                    + (ScriptDelayPerThread * (totalThreadCount - threadCountToDeploy))
                const args = [target, String(processId++), (constDelayThread).toFixed(0)]
                ns.print(`Started running ${type} for ${target} on ${server} with ${deployed}`)
                ns.exec(scripts[type].filename, server, deployed, ...args)
                maxThreads -= deployed
                threadCountToDeploy -= deployed
            }
        }

        return threadCountToDeploy
    }






    // ================================================
    //    MAIN SETUP
    // ================================================

    ns.tail()
    const LONG_WAIT_BETWEEN_RERUNS = 4 * 60_000



    getAllServers()
    // ns.print(`All Servers: ${[...allServers.keys()]}`)

    if (dataFlags.sr) {
        stopRunningProcesses()
    }

    while (true) {

        hackAllServers()
        // ns.print(`All Hacked: ${hackedServers.join(" ")}`)

        updateAttackServers()
        // ns.print(`All Attack: ${attackers.join(" ")}`)

        // updateRunningProcesses()

        updateAllTargets()
        // ns.print(`All Targets: ${Object.values(targets)}`)

        ns.print(`Updated all Servers`)


        let bestTargetServers: ServerForHackingInfo[]




        do {
            while (weakeningTargets_Set.size > 0) {
                ns.print(`Wait for ${weakeningTargets_Set.size} prepare Servers to Finish`)
                await ns.sleep(10_000)
            }


            bestTargetServers = getBestTargets(6)
            // ns.tprint(`Best Target Servers: ${bestTargetServers.length} ${bestTargetServers.map(bestTarget => bestTarget.hostname).join(", ")}`)
            // bestTargetServers.forEach((bestTarget) => printServerStatus(bestTarget))


            // ns.print(targets.join(", "))

            for (let i = 0; i < 3; i++) {
                if (bestTargetServers[i] && bestTargetServers[i].hostname) {
                    // let target of bestTargetServers
                    ns.print(`bestTargetServers[${i}] ${bestTargetServers[i].hostname}`)
                    if (!prepareTargetForHack(bestTargetServers[i].hostname)) {
                        weakeningTargets_Set.add(bestTargetServers[i].hostname)
                        setTimeout(() => {
                            weakeningTargets_Set.delete(bestTargetServers[i].hostname)
                            weakenedTargets.push(bestTargetServers[i].hostname)
                        }, Math.max(ns.getGrowTime(bestTargetServers[i].hostname), ns.getWeakenTime(bestTargetServers[i].hostname)) + 100)
                        break
                    }
                }
            }


        } while (getTotalFreeRam() < (1.75 * hackedServers.length))


        bestTargetServers = getBestTargets(6)

        ns.tprint(`Best Target Servers: ${bestTargetServers.length} ${bestTargetServers.map(bestTarget => bestTarget.hostname).join(", ")}`)
        bestTargetServers.forEach((bestTarget) => printServerStatus(bestTarget))


        // ratio attack Best Target
        if (bestTargetServers.length > 0)
            ratioAttack(bestTargetServers[0], 0.5)
        if (bestTargetServers.length > 1)
            ratioAttack(bestTargetServers[1], 0.6)
        if (bestTargetServers.length > 2)
            ratioAttack(bestTargetServers[2], 0.90)

        const now = new Date();
        ns.print(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} Wait for ${formatTime(LONG_WAIT_BETWEEN_RERUNS)}`)
        await ns.sleep(LONG_WAIT_BETWEEN_RERUNS)
    }
    // ================================================
    //    MAIN LOOP
    // ================================================



    // // while (true) {
    // hackAllServers()
    // updateAttackServers()
    // // updateRunningProcesses()
    // updateAllTargets()

    // // }






}