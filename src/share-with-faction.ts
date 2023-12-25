import { NS } from '@ns'


export async function main(ns: NS): Promise<void> {

    const scriptName = 'bin/' + ns.getScriptName() + ".exec.js"

    const targetCount: number = ns.args[0] as number

    ns.write(scriptName,
        `import { NS } from '@ns'


export async function main(ns: NS): Promise<void> {
  while(true){
    await ns.share()
  } 
}`, "w")

    // if (!target)
    //   throw ("TargetServer in Arg[0] not provided")

    // if (!ns.serverExists(target))
    //   throw ("Target doesn't exist")

    const ramScript = ns.getScriptRam(scriptName)


    ns.tail()


    const scriptsToKill = [
        "early-hack-template.js",
        "bin/z_growLoop.js",
        "bin/z_weakLoop.js",
        "bin/z_hackLoop.js",
        "bin/z_growOnce.js",
        "bin/z_weakOnce.js",
        "bin/z_hackOnce.js"
    ]

    for (let i = 0; i < targetCount; i++) {
        const target = `pserv-${i}`

        scriptsToKill.forEach(script => ns.scriptKill(script, target))

        // ns.killall(target)
        // ns.scriptKill(scriptName, target)
        let numberOfTimes = Math.floor((ns.getServerMaxRam(target) - ns.getServerUsedRam(target)) / ramScript)
        if (target == "home") {
            numberOfTimes = Math.floor((ns.getServerMaxRam(target) * 0.75 - ns.getServerUsedRam(target)) / ramScript)
        } else {
            ns.scp(scriptName, target, "home")
        }
        if (numberOfTimes > 0)
            ns.exec(scriptName, target, numberOfTimes, target)

    }
}
