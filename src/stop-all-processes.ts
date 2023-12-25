import { NS } from '@ns'


export async function main(ns: NS): Promise<void> {




    let allServers: string[] = []

    function getAllServers() {
        allServers = []
        allServers.push("home")
        const findAdjasentServers = (hostname: string) => {
            ns.scan(hostname)
                .forEach((server) => {
                    if (!allServers.includes(server)) {
                        allServers.push(server)
                        findAdjasentServers(server)
                    }
                })
        }
        findAdjasentServers("home")
    }

    getAllServers()

    const scriptsToKill = [
        "early-hack-template.js",
        "bin/z_growLoop.js",
        "bin/z_weakLoop.js",
        "bin/z_hackLoop.js",
        "bin/z_growOnce.js",
        "bin/z_weakOnce.js",
        "bin/z_hackOnce.js"
    ]

    for (const hostname of allServers) {
        scriptsToKill.forEach(script => ns.scriptKill(script, hostname))

        // let processes = ns.ps(hostname)
        // for (let process of processes) {
        //   ns.kill(process.pid)
        // }
    }

}