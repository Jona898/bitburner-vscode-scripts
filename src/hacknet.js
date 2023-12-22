/** @param {NS} ns */
export async function main(ns) {


  const checkM = (c, d) => eval(c < ns.getPlayer().money / d)




  /** @type {boolean} */
  let netManager = true; // await ns.prompt('Activate Hacknet Manager?', { type: "boolean" });
  if (!netManager) { ns.exit() }

  ns.tail();

  async function hnManager() {

    if (checkM(ns.hacknet.getPurchaseNodeCost(), 20)) {
      ns.tprint(`Purchased Hacknet Node: ${ns.hacknet.purchaseNode()}`)

    }
    for (let i = ns.hacknet.numNodes() - 1; i >= 0; i--) {
      for (let part of ['Level', 'Ram', 'Core']) {
        if (checkM(ns.hacknet['get' + part + 'UpgradeCost'](i), 20)) {
          ns.hacknet['upgrade' + part](i);
        }
      }
    }
  }



  while (true) {
    await hnManager()




    await ns.sleep(1000)
  }
}