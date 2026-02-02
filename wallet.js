let wallet;
let provider;

const networks = {
  polygon: {
    rpc: "https://polygon-rpc.com",
    symbol: "MATIC"
  },
  fuse: {
    rpc: "https://rpc.fuse.io",
    symbol: "FUSE"
  }
};

// 🔥 ERC20 exemple (DIR sur Fuse)
const TOKEN = {
  address: "0xe5B6ff5E9Df4858E8e65119Dd259C40DBD9808d7",
  decimals: 18
};

function getProvider() {
  const net = document.getElementById("network").value;
  provider = new ethers.JsonRpcProvider(networks[net].rpc);
}

function encrypt(text, pin) {
  return btoa(text + pin);
}

function decrypt(text, pin) {
  const data = atob(text);
  return data.replace(pin, "");
}

function createWallet() {
  const pin = document.getElementById("pin").value;
  if (!pin) return alert("PIN requis");

  wallet = ethers.Wallet.createRandom();
  const encrypted = encrypt(wallet.privateKey, pin);
  localStorage.setItem("wallet", encrypted);
  alert("Wallet créé !");
}

async function unlockWallet() {
  const pin = document.getElementById("pin").value;
  const data = localStorage.getItem("wallet");
  if (!data) return alert("Aucun wallet");

  try {
    const pk = decrypt(data, pin);
    wallet = new ethers.Wallet(pk);
    getProvider();
    showInfo();
  } catch {
    alert("PIN incorrect");
  }
}

async function showInfo() {
  document.getElementById("address").textContent = wallet.address;

  const bal = await provider.getBalance(wallet.address);
  document.getElementById("balance").textContent =
    ethers.formatEther(bal);

  const abi = ["function balanceOf(address) view returns (uint256)"];
  const token = new ethers.Contract(TOKEN.address, abi, provider);
  const tb = await token.balanceOf(wallet.address);
  document.getElementById("tokenBalance").textContent =
    ethers.formatUnits(tb, TOKEN.decimals);
}

async function sendToken() {
  const to = document.getElementById("to").value;
  const amount = document.getElementById("amount").value;

  const signer = wallet.connect(provider);

  const abi = [
    "function transfer(address,uint256) returns (bool)"
  ];
  const token = new ethers.Contract(TOKEN.address, abi, signer);

  const tx = await token.transfer(
    to,
    ethers.parseUnits(amount, TOKEN.decimals)
  );

  alert("Tx envoyée : " + tx.hash);
}

