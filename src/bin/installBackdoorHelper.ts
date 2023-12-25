import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
    await ns.singularity.installBackdoor();
    ns.tprint(`Installed backdoor ${ns.args[0]} worked`)
}