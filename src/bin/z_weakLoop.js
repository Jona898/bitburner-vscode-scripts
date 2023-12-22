export async function main(ns) {
  if (typeof ns.args[2] == "number" && ns.args[2] > 0)
    ns.print("wait for " + ns.args[2] / 1000 + "s");
    await ns.sleep(ns.args[2]);
  do {
    await ns.weaken(ns.args[0]);
  } while(true)
}