import { NS } from '@ns'


export async function main(ns: NS): Promise<void> {


    const checkM = (c: number, d: number) => { return c < ns.getPlayer().money / d }





    ns.tail();

    async function hnManager() {

        if (checkM(ns.hacknet.getPurchaseNodeCost(), 20)) {
            ns.tprint(`Purchased Hacknet Node: ${ns.hacknet.purchaseNode()}`)

        }
        for (let i = ns.hacknet.numNodes() - 1; i >= 0; i--) {
            if (checkM(ns.hacknet.getLevelUpgradeCost(i), 20)) {
                ns.hacknet.upgradeLevel(i);
            }
            if (checkM(ns.hacknet.getRamUpgradeCost(i), 20)) {
                ns.hacknet.upgradeRam(i);
            }
            if (checkM(ns.hacknet.getCoreUpgradeCost(i), 20)) {
                ns.hacknet.upgradeCore(i);
            }
        }
    }



    while (true) {
        await hnManager()




        await ns.sleep(1000)
    }
}