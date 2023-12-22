/** @param {NS} ns */
export  function main(ns) {
  const inf = ns.infiltration

  let locations = inf.getPossibleLocations()
    .sort((a, b) => inf.getInfiltration(a.name).difficulty - inf.getInfiltration(b.name).difficulty)

  for (const loc of locations) {
    const data = inf.getInfiltration(loc.name)

    ns.tprint(`${loc.city.padEnd(9)} - ${loc.name.padEnd(25)} - ${data.difficulty.toFixed(1).padStart(4)} ${ns.formatNumber(data.reward.tradeRep,1).padStart(6)} ${data.reward.SoARep.toFixed(1).padStart(6)}`)
  }

}