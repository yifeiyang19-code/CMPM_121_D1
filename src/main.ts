import { createInitialGameState } from "./state.ts";
import { manualGenerate } from "./input.ts";
import { advanceTime, type GameState } from "./automation.ts";

// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";
import { getUpgradeCost, purchaseUpgrade } from "./upgrades.ts";

let state = createInitialGameState();

const app = document.querySelector<HTMLElement>("#app")!;

app.innerHTML = `
  <section class="station">
    <h1>Power Station</h1>
    <p>Restore the abandoned power station.</p>

    <section>
      <h2>Energy Status</h2>
      <p>Stored Energy: <output id="energy">0</output> EU</p>
      <p>Total Produced: <output id="total-energy">0</output> EU</p>
      <p>Generators: <output id="generators">0</output></p>
      <p>Production Rate: <output id="production-rate">0</output> EU/s</p>
    </section>

    <button id="generate" type="button">
      Generate Energy
    </button>
    <button id="buy-generator" type="button" disabled>
      Buy Generator (10 EU)
    </button>
        <button id="buy-click" type="button" disabled>
      Upgrade Click Power (20 EU)
    </button>
        <button id="buy-generator-power" type="button" disabled>
      Upgrade Generator Power (50 EU)
    </button>
        <button id="buy-turbine-overhaul" type="button" disabled>
      Turbine Overhaul (100 EU)
    </button>
  </section>
`;
const button = document.querySelector<HTMLButtonElement>("#generate");
const generatorButton = document.querySelector<HTMLButtonElement>(
  "#buy-generator",
);
const clickButton = document.querySelector<HTMLButtonElement>(
  "#buy-click",
);
const generatorPowerButton = document.querySelector<HTMLButtonElement>(
  "#buy-generator-power",
);
const turbineOverhaulButton = document.querySelector<HTMLButtonElement>(
  "#buy-turbine-overhaul",
);
const energyOutput = document.querySelector<HTMLOutputElement>("#energy");
const totalEnergyOutput = document.querySelector<HTMLOutputElement>(
  "#total-energy",
);
const generatorsOutput = document.querySelector<HTMLOutputElement>(
  "#generators",
);
const productionRateOutput = document.querySelector<HTMLOutputElement>(
  "#production-rate",
);

const image = document.createElement("img");
image.src = tileUrl;
image.alt = "A teal tile with a cream circle";
image.width = 96;
image.height = 96;
app.append(image);

if (
  !button || !generatorButton || !energyOutput || !totalEnergyOutput ||
  !generatorsOutput ||
  !productionRateOutput || !clickButton || !generatorPowerButton ||
  !turbineOverhaulButton
) {
  throw new Error("Missing required elements in the DOM");
}

function render(state: GameState): void {
  button!.textContent = "Generate Energy (+" + state.clickPower + " EU)";
  const generatorCost = getUpgradeCost(state, "generator");
  const clickCost = getUpgradeCost(state, "click");
  const generatorPowerCost = getUpgradeCost(state, "generatorPower");
  const turbineOverhaulCost = getUpgradeCost(state, "turbineOverhaul");
  energyOutput!.textContent = state.energy.toFixed(2);
  totalEnergyOutput!.textContent = state.totalEnergyProduced.toFixed(2);
  generatorsOutput!.textContent = state.generatorCount.toString();
  productionRateOutput!.textContent =
    (state.generatorCount * state.generatorPower).toString();
  generatorButton!.textContent = "Buy Generator (" + generatorCost + " EU)";
  generatorButton!.disabled = state.energy < generatorCost;
  clickButton!.textContent = "Upgrade Click Power (" + clickCost + " EU)";
  clickButton!.disabled = state.energy < clickCost;
  generatorPowerButton!.textContent = "Upgrade Generator Power (" +
    generatorPowerCost + " EU)";
  generatorPowerButton!.disabled = state.energy < generatorPowerCost;
  turbineOverhaulButton!.textContent = "Turbine Overhaul (" +
    turbineOverhaulCost + " EU)";
  turbineOverhaulButton!.disabled = state.energy < turbineOverhaulCost;
}

render(state);

let lastTime = performance.now();

function updateGameTime(): void {
  const currentTime = performance.now();
  const seconds = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  state = advanceTime(state, seconds);
  render(state);
}

setInterval(updateGameTime, 100);

button.addEventListener("click", () => {
  updateGameTime();
  state = manualGenerate(state);
  render(state);
});

generatorButton.addEventListener("click", () => {
  updateGameTime();
  state = purchaseUpgrade(state, "generator").state;
  render(state);
});

clickButton.addEventListener("click", () => {
  updateGameTime();
  state = purchaseUpgrade(state, "click").state;
  render(state);
});

generatorPowerButton.addEventListener("click", () => {
  updateGameTime();
  state = purchaseUpgrade(state, "generatorPower").state;
  render(state);
});

turbineOverhaulButton.addEventListener("click", () => {
  updateGameTime();
  state = purchaseUpgrade(state, "turbineOverhaul").state;
  render(state);
});
