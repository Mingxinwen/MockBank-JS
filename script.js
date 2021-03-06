'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

//Pre set Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2022-04-01T10:17:24.185Z',
    '2022-04-03T14:11:59.604Z',
    '2022-04-27T17:01:17.194Z',
    '2022-04-28T23:36:17.929Z',
    '2022-04-30T10:51:36.790Z',
  ],
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,

  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let inputUser;
let currentUser;
let timer;
let sortFunc = false;

//Log in Function
btnLogin.addEventListener('click', function (e) {
  //stop submit button to refesh page
  e.preventDefault();

  inputUser = accounts.find(acc => acc.name === inputLoginUsername.value);

  if (inputUser?.pin === Number(inputLoginPin.value)) {
    console.log('Successfuly Log in');
    currentUser = inputUser;
    console.log(currentUser);

    //show UI and welcome message
    labelWelcome.textContent = `Welcome back, ${currentUser.owner}`;
    containerApp.style.opacity = 100;
    //update
    pageUpdate(currentUser);
    //check timer and start
    if (timer) clearInterval(timer);
    timer = logOutTimer();

    //clear input after login
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    //remove the focus on the pin input
    inputLoginPin.blur();
  } else {
    console.log('Check your username and pin');
  }
});

//display day
const now = new Date();
const day = now.getDate();
const month = now.getMonth() + 1;
const year = now.getFullYear();
const hour = now.getHours();
const min = now.getMinutes();
labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

//calculate transaction days
const transactionDaysCalc = function (date) {
  const calDay = (today, day) =>
    Math.round((today - day) / (1000 * 60 * 60 * 24));

  const daysPassed = calDay(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
};

const calDay = (today, day) => Math.abs(today - day) / (1000 * 60 * 60 * 24);
console.log(calDay(new Date(2022, 4, 30), new Date(2022, 4, 20)));
//display transaction list
const displayTransaction = function (account, sort = false) {
  containerMovements.innerHTML = '';
  const sortTransaction = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;
  sortTransaction.forEach(function (mov, ind) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const dateTrans = new Date(account.movementsDates[ind]);
    const day = dateTrans.getDate();
    const month = dateTrans.getMonth() + 1;
    const year = dateTrans.getFullYear();
    const listDay = transactionDaysCalc(dateTrans);

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      ind + 1
    } ${type}</div>
          <div class="movements__date">${listDay}</div>
          <div class="movements__value">${mov}</div>
        </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// page refresh
const pageUpdate = function (account) {
  //update
  displayTransaction(account);
  showBalance(account);
  showDeposit(account);
  showWithdrawal(account);
};

//calculate the current balance
const showBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);
  labelBalance.textContent = `${acc.balance}`;
};

// calculate the total deposit
const showDeposit = function (account) {
  const totalDeposit = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumIn.textContent = `${totalDeposit}`;
};

// calculate the total withdrawal
const showWithdrawal = function (account) {
  const totalWithdrawal = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumOut.textContent = `${totalWithdrawal}`;
};

//create user name by user's name
const createUserName = function (accounts) {
  accounts.forEach(function (account) {
    account.name = account.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserName(accounts);
// console.log(accounts);

// Transfer money
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(acc => acc.name === inputTransferTo.value);
  console.log(amount, receiverAcc);

  if (
    amount > 0 &&
    receiverAcc &&
    currentUser.balance >= amount &&
    receiverAcc?.name !== currentUser.name
  ) {
    currentUser.movements.push(-amount);
    receiverAcc.movements.push(amount);
    currentUser.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    pageUpdate(currentUser);
    //clear input
    inputTransferAmount.value = inputTransferTo.value = '';
  } else {
    console.log('transfer faild');
  }
});

//clsoe account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentUser.name &&
    Number(inputClosePin.value) === currentUser.pin
  ) {
    const index = accounts.findIndex(acc => acc.name === currentUser.name);
    accounts.splice(index, 1);
    //hide UI and welcome message
    containerApp.style.opacity = 0;
    //clear input
    inputCloseUsername.value = inputClosePin.value = '';
  } else {
    alert('close account failed, check the pin again');
  }
});

//sort transcation function
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayTransaction(currentUser, !sortFunc);
  sortFunc = !sortFunc;
});

// timer function
const logOutTimer = function () {
  let countTime = 300;
  const tick = function () {
    const min = String(Math.trunc(countTime / 60)).padStart(2, '0');
    const sec = String(countTime % 60).padStart(2, '0');
    labelTimer.textContent = `${min}:${sec}`;
    if (countTime === 0) {
      clearInterval(timer);
      currentUser = '';
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get start!';
    }
    countTime--;
  };
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

//total deposit
// const bankDepositSum = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov > 0)
//   .reduce((sum, cur) => sum + cur, 0);

// console.log(bankDepositSum);

// // number of deposit bigger than 1000
// const bigDeposit = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov >= 1000);
// console.log(bigDeposit.length);

// //Sum all the deposit and withdrawals as object
// const sums = accounts
//   .flatMap(acc => acc.movements)
//   .reduce(
//     (sums, cur) => {
//       cur > 0 ? (sums.deposit += cur) : (sums.withdrawal += cur);
//       return sums;
//     },
//     { deposit: 0, withdrawal: 0 }
//   );
// console.log(sums);

// //convert string to upper case
// const convertitle = function (title) {
//   const expections = ['a', 'an', 'the'];
//   const titleCase = title
//     .toLowerCase()
//     .split(' ')
//     .map(word =>
//       expections.includes(word) ? word : word[0].toUpperCase() + word.slice(1)
//     );
//   return titleCase;
// };
// console.log(convertitle('this is a test!'));
// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// const withdrawals = movements.filter(function (movement) {
//   return movement < 0;
// });
// console.log(withdrawals);

// const balance = movements.reduce(function (acc, cur, i) {
//   return acc + cur;
// }, 1000);
// console.log(balance);
/////////////////////////////////////////////////
///////////////////////////////////////
// Coding Challenge #1

/* 
Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age, and stored the data into an array (one array for each). For now, they are just interested in knowing whether a dog is an adult or a puppy. A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.

Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:

1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs! So create a shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters)
2. Create an array with both Julia's (corrected) and Kate's data
3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy ????")
4. Run the function for both test datasets

HINT: Use tools from all lectures in this section so far ????

TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

GOOD LUCK ????
*/
// const Julia = [3, 5, 2, 12, 7];
// const Kate = [4, 1, 15, 8, 3];

// const checkDogs = function (Julia, Kate) {
//   let copyJulia = Julia;
//   copyJulia.splice(-2, 2);
//   copyJulia.splice(0, 1);
//   const dogs = copyJulia.concat(Kate);
//   console.log(dogs);

//   dogs.forEach(function (dog, ind) {
//     if (dog > 3) {
//       console.log(`Dog number ${ind + 1} is an adult, and is ${dog} years old`);
//     } else {
//       console.log(`Dog number ${ind + 1} is still a puppy ????`);
//     }
//   });
// };

///////////////////////////////////////
// Coding Challenge #2

/* 
Let's go back to Julia and Kate's study about dogs. This time, they want to convert dog ages to human ages and calculate the average age of the dogs in their study.

Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in order:

1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old, humanAge = 16 + dogAge * 4.
2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old)
3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages ????)
4. Run the function for both test datasets

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK ????
*/

// const calHumanAge = function (dogs) {
//   const humanAge = dogs.map(dog => (dog <= 2 ? 2 * dog : 16 + 4 * dog));
//   const adult = humanAge.filter(age => age >= 18);
//   const totalAge = adult.reduce(
//     (acc, age, i, arr) => acc + age / arr.length,
//     0
//   );

//   return totalAge;
// };

// const DATA1 = [5, 2, 4, 1, 15, 8, 3];
// const DATA2 = [16, 6, 10, 5, 6, 1, 4];

// const r1 = calHumanAge(DATA1);
// console.log(r1);
// checkDogs(Julia, Kate);
// const EUDToUSD = 1.25;

// const movementsUSD = movements.map(function (mov) {
//   return mov * EUDToUSD;
// });

// console.log(movements);
// console.log(movementsUSD);

///////////////////////////////////////
// Coding Challenge #4

/* 
Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended portion (see hint).

1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it to the object as a new property. Do NOT create a new array, simply loop over the array. Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) ????
3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and an array with all owners of dogs who eat too little ('ownersEatTooLittle').
4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended (just true or false)
6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false)
7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order (keep in mind that the portions are inside the array's objects)

HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them ????
HINT 2: Being within a range 10% above and below the recommended portion means: current > (recommended * 0.90) && current < (recommended * 1.10). Basically, the current portion should be between 90% and 110% of the recommended portion.

TEST DATA:
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] }
];

GOOD LUCK ????
*/
// const dogs = [
//   { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
//   { weight: 8, curFood: 200, owners: ['Matilda'] },
//   { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
//   { weight: 32, curFood: 340, owners: ['Michael'] },
// ];

// dogs.forEach(dog => {
//   dog.recomFood = Math.trunc(dog.weight ** 0.75 * 28);
// });
// //2
// const found = dogs.find(dog => dog.owners.includes('Sarah'));
// console.log(found);
// console.log(
//   `Sarah's dog is eating ${
//     found.curFood > found.recomFood ? 'too much.' : 'too little.'
//   }`
// );
// //3
// const eatingTooMuch = dogs
//   .filter(dog => dog.curFood > dog.recomFood)
//   .flatMap(dog => dog.owners);
// const eatingTooLittle = dogs
//   .filter(dog => dog.curFood < dog.recomFood)
//   .flatMap(dog => dog.owners);
// console.log(eatingTooMuch);
// //4
// console.log(`${eatingTooMuch.join(' and ')} dog eating too much!`);
// //5
// const same = dogs.some(dog => dog.curFood === dog.recomFood);
// console.log(same);
// //6
// const okay = dogs.some(
//   dog =>
//     dog.curFood <= 1.1 * dog.recomFood && dog.curFood >= 0.9 * dog.recomFood
// );
// console.log(okay);
// //7
// const goodEatingDog = dogs.filter(
//   dog =>
//     dog.curFood <= 1.1 * dog.recomFood && dog.curFood >= 0.9 * dog.recomFood
// );
// console.log(goodEatingDog);
// //sorted dogs by weight
// const sortedDogs = dogs.slice().sort((a, b) => a.curFood - b.curFood);
// console.log(sortedDogs);
