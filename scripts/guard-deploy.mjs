const site = (process.env.SITE_NAME ?? "").trim().toLowerCase();
const urls = [process.env.URL, process.env.DEPLOY_URL, process.env.DEPLOY_PRIME_URL]
  .filter(Boolean)
  .join(" ")
  .toLowerCase();

const blockedIds = new Set(["b554edad-1152-4e37-b0cb-60124c79adbf"]);
const blockedNames = new Set(["sending", "sendingchurch", "sending-church", "sending-church-main"]);
const blockedUrl = urls.includes("sending.church") || urls.includes("sendingchurch.netlify");

if (blockedIds.has((process.env.SITE_ID ?? "").toLowerCase()) || blockedNames.has(site) || blockedUrl) {
  console.error("Refusing to build. Read Talk Pray must not deploy to the Sending Church site.");
  console.error(`SITE_NAME=${process.env.SITE_NAME ?? ""}`);
  process.exit(1);
}
