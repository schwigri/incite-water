const config = {
  apiKey: "AIzaSyD6jtPfG6lJLRzBwZsKWfDTuQj54p6cmVw",
  authDomain: "water-project-da557.firebaseapp.com",
  databaseURL: "https://water-project-da557.firebaseio.com",
  projectId: "water-project-da557",
  storageBucket: "water-project-da557.appspot.com",
  messagingSenderId: "858447631180"
};
firebase.initializeApp(config);

let db = firebase.firestore();
let rt = firebase.database();

let Calculator = class {
  constructor(existingData) {
    this.utilities = {
      waterStorage: [
        {
          name: 'RTS Black with Spiggot',
          cost: 200
        },
        {
          name: 'Gcube IBC Tank',
          cost: 500
        },
        {
          name: 'Bushman 530',
          cost: 1170,
        },
        {
          name: 'Norwesco 1000',
          cost: 1500
        },
      ],
      washingmachine: [
        {
          name: 'Magic Chef Compact Top Load Washer',
          cost: 241
        },
        {
          name: 'Amana Top Load Washer',
          cost: 400
        },
        {
          name: 'Whirlpool High-Efficiency Top Load Washer',
          cost: 700
        },
      ]
    };
    if (existingData) {
      this.data = existingData;
    }
    this.data.averageRain = window.averageRain / 12 * 365 * 0.26;
    this.data.maxRain = window.maxRain * 30 * 0.26;
    this.data.waterPrice = window.waterPrice / 748;
  }

  calculate() {
    let output = {
      waterSavings: 0,
      dollarSavings: 0,
      cost: 0,
      brands: {},
      credits: 0,
      creditPotential: 0,
      paybackMonths: 0,
      creditPaybackMonths: 0,
      bottles: 0,
    };
    if (this.data.space > 0) {
      let cost = 0;
      let maxCapacity = this.data.maxRain * this.data.householdSize * 0.7;
      let spaceCapacity = this.data.space * 150;
      let desiredCapacity = Math.min(maxCapacity, spaceCapacity);
      if (0 < desiredCapacity < 150) {
        cost = this.utilities.waterStorage[0].cost;
        output.brands.waterStorage = this.utilities.waterStorage[0].name;
      } else if (150 <= desiredCapacity < 300) {
        cost = this.utilities.waterStorage[1].cost;
        output.brands.waterStorage = this.utilities.waterStorage[1].name;
      } else if (300 <= desiredCapacity < 450) {
        cost = this.utilities.waterStorage[2].cost;
        output.brands.waterStorage = this.utilities.waterStorage[2].name;
      } else {
        cost = this.utilities.waterStorage[3].cost;
        output.brands.waterStorage = this.utilities.waterStorage[3].name;
      }
      output.cost += cost;
      output.waterSavings += desiredCapacity * 12;
      output.dollarSavings += (desiredCapacity * this.data.waterPrice * 12);
    }
    if (this.data.toilet) {
      let ts = 26.7 * this.data.householdSize * 0.2 * 365;
      let cost = 213;
      if (!this.data.diy) {
        cost += 173;
      }
      output.cost += cost;
      output.waterSavings += ts;
      output.dollarSavings += (ts * this.data.waterPrice);
    }
    if (this.data.dishwasher) {
      let ds = 5 * Math.min(this.data.householdSize, 7) * 52;
      let cost = 499;
      if (!this.data.diy) {
        cost += 109;
      }
      output.cost += cost;
      output.waterSavings += ds;
      output.dollarSavings += (ds * this.data.waterPrice);
    }
    if (this.data.washingmachine !== 'new') {
      let cost = 0;
      let brand = '';
      let savingPotential = 27;
      if (this.data.washingmachine !== 'old') {
        savingPotential = 12;
      }
      let ws = savingPotential * 52 * Math.min(this.data.householdSize * 1.5, 7);
      if (this.data.householdSize <= 2) {
        cost = this.utilities.washingmachine[0].cost;
        brand = this.utilities.washingmachine[0].name;
      } else if (3 <= this.data.householdSize <= 4) {
        cost = this.utilities.washingmachine[1].cost;
        brand = this.utilities.washingmachine[1].name;
      } else {
        cost = this.utilities.washingmachine[2].cost;
        brand = this.utilities.washingmachine[2].name;
      }
      output.cost += cost;
      output.waterSavings += ws;
      output.dollarSavings += (ws * this.data.waterPrice);
      output.brands.washingmachine = brand;
    }
    if (this.data.showerheadsLowFlow) {
      console.log('can get new showerheads');
      let ss = 1 * 8.2 * this.data.householdSize * 365;
      let cost = 20;
      output.cost += cost;
      output.waterSavings += ss;
      output.dollarSavings += (ss * this.data.waterPrice);
    }
    if (this.data.garden) {
      console.log('yay garden!');
      let gs = 30 * 52 * Math.min(this.data.householdSize * 1.5, 7) + 1.5 * 8.2 * this.data.householdSize * 365;
      let cost = 500;
      if (!this.data.diy) {
        cost += 399 + 1800 + 399;
      }
      output.cost += cost;
      output.waterSavings += gs;
      output.dollarSavings += (gs * this.data.waterPrice);
    }
    output.credits = output.waterSavings / 1000;
    output.creditPotential = output.credits * 9;
    output.paybackMonths = output.cost / output.dollarSavings;
    output.creditPaybackMonths = output.cost / (output.dollarSavings + output.creditPotential);
    output.bottles = output.waterSavings * 7.57;
    return output;
  }
};

let Application = class {
  constructor() {
    this.pages = document.querySelectorAll('.page');
    this.pageIndicatorContainer = document.getElementById('pages-pagination');
    this.pageIndicators = document.querySelectorAll('.page-indicator');
    let self = this;
    this.inputs = {
      householdSize: document.getElementById('household-size'),
      roofSize: document.getElementById('roof-size'),
      spaceAvailable: document.getElementById('space-available'),
      openToDiy: document.getElementById('open-to-diy'),
      toiletAge: document.getElementById('toilet-age'),
      dishwasherAge: document.getElementById('dishwasher-age'),
      washingMachineAge: document.getElementById('washing-machine-age'),
      showerheads: document.getElementById('showerheads-low-flow'),
      garden: document.getElementById('garden'),
    };

    let continueButtons = document.querySelectorAll('.page button.continue');
    for (let button of continueButtons) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        if (button.disabled == false) {
          let thisPage =  parseInt(button.parentNode.parentNode.dataset.page);
          let nextPage = thisPage + 1;
          self.showPage('calculator-page-' + nextPage)
        }
      });
    }
    let backButtons = document.querySelectorAll('.page button.back-button');
    for (let button of backButtons) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        if (button.disabled == false) {
          let nextPage = button.dataset.target;
          self.showPage('calculator-page-' + nextPage)
        }
      });
    }

    let cInputs = this.inputs;
    let calculateButton = document.getElementById('p3done-button');
    calculateButton.addEventListener('click', (e) => {
      e.preventDefault();
      let data = {
        space: parseInt(cInputs.spaceAvailable.value),
        householdSize: parseInt(cInputs.householdSize.value),
        diy: cInputs.openToDiy.value == 'true',
        dishwasher: cInputs.dishwasherAge.value == 'old',
        washingmachine: cInputs.washingMachineAge.value,
        showerheadsLowFlow: cInputs.showerheads.value == 'no' || cInputs.showerheads.value == 'maybe',
        garden: cInputs.garden.value == 'flowers',
      };
      let calculator = new Calculator(data);
      let results = calculator.calculate();
      let dollarSavings = ('' + results.dollarSavings).split('.');
      let waterSavings = ('' + results.waterSavings).split('.');
      if (waterSavings[1]) {
        waterSavings = waterSavings[0] + '.' + waterSavings[1].substring(0, 2);
      } else {
        waterSavings = waterSavings[0];
      }
      if (dollarSavings[1]) {
        dollarSavings = dollarSavings[0] + '.' + dollarSavings[1].substring(0, 2);
      } else {
        dollarSavings = dollarSavings[0];
      }
      document.getElementById('water-savings').innerHTML = waterSavings;
      document.getElementById('dollar-savings').innerHTML = dollarSavings;
      document.getElementById('cost').innerHTML = results.cost;

      document.getElementById('credits').innerHTML = results.credits.toFixed(2);
      document.getElementById('credits-potential').innerHTML = results.creditPotential.toFixed(2);
      document.getElementById('payback-months').innerHTML = results.paybackMonths.toFixed(2);
      document.getElementById('credits-payback').innerHTML = results.creditPaybackMonths.toFixed(2);
      document.getElementById('bottles-saved').innerHTML = results.bottles.toFixed(2);

      let url = "dashboard.html";
      url += '?d=' + dollarSavings;
      url += '&g=' + waterSavings;
      url += '&c=' + results.cost;
      url += '&p=' + results.paybackMonths.toFixed(2);
      url += '&cr=' + results.credits.toFixed(2);
      url += '&cv=' + results.creditPotential.toFixed(2);
      url += '&sp=' + results.creditPaybackMonths.toFixed(2);

      document.getElementById('dashboard').src = url;

      self.showPage('calculator-page-4');
    });

    this.checkPages(this.inputs);
  }

  checkPages (inputs) {
    let checkPageOne = () => {
      let continueButton = document.getElementById('p1done-button');
      let pageOneRegex = /^[0-9]+$/;
      inputs.roofSize.addEventListener('input', () => {
        let v = inputs.roofSize.value;
        if (v == '' || !v.match(pageOneRegex)) {
          continueButton.disabled = true;
        } else {
          continueButton.disabled = false;
        }
      });
    };
    checkPageOne();
  }

  showPage (id) {
    for (let page of this.pages) {
      page.classList.remove('current');
    }
    window.setTimeout(() => {
      let target = document.getElementById(id);
      if (target.dataset.page) {
        let p = parseInt(target.dataset.page);
        if (p < 4) {
          this.pageIndicatorContainer.classList.add('visible');
          for (let id of this.pageIndicators) {
            id.classList.remove('filled');
          }
          for (let i = 0; i < p; i++) {
            let indicator = this.pageIndicators[i];
            indicator.classList.add('filled');
          }
        } else {
          document.getElementById('pages-pagination').style.visibility = 'hidden';
        }
      } else {
        this.pageIndicatorContainer.classList.remove('visible');
      }
      target.classList.add('current');
    }, 500);
  }
};

let application = new Application();
let theURL = new URL(window.location.href);
let theZipCode = theURL.searchParams.get('zip');
if (theZipCode && theZipCode.length === 5) {
  rt.ref('/zipcodes/' + theZipCode).once('value').then((snapshot) => {
    console.log(snapshot.val());
    window.averageRain = snapshot.val().averageRain;
    window.maxRain = snapshot.val().maxRain;
    window.zipcode = theZipCode;
    if (snapshot.val().waterPrice) {
      window.waterPrice = snapshot.val().waterPrice;
    } else {
      window.waterPrice = 0;
    }
    application.showPage('calculator-page-1');

  });
} else {
  window.location.href = '/sign-up/';
}