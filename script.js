const fs = require('fs');


const checks = fs.readFileSync('чеки.txt', 'utf-8').split('\n').map(check => check.trim());


function getMonth(check) {
  const parts = check.split('_');
  return parts[parts.length - 1].replace('.pdf', '');
}


const checksByMonth = {};
checks.forEach(check => {
  const month = getMonth(check);
  if (!checksByMonth[month]) {
    checksByMonth[month] = [];
  }
  checksByMonth[month].push(check);
});


function isMonthPaid(month, services) {
  const monthChecks = checksByMonth[month];
  if (!monthChecks) {
    return false;
  }
  for (let i = 0; i < services.length; i++) {
    if (!monthChecks.includes(`${services[i]}_${month}.pdf`)) {
      return false;
    }
  }
  return true;
}


let result = '';
Object.keys(checksByMonth).forEach(month => {
  result += `<h2>${month}:</h2>`;
  result += '<ul>';
  checksByMonth[month].forEach(check => {
    result += `<li>${check}</li>`;
  });
  result += '</ul>';
  const unpaidServices = ['газоснабжение', 'ГВС', 'домофон', 'капремонт', 'квартплата', 'ТБО', 'теплоснабжение', 'ХВС', 'электроснабжение'].filter(service => !isMonthPaid(month, [service]));
  if (unpaidServices.length > 0) {
    result += '<h3>Не оплачены:</h3>';
    result += `<ul>`;
    unpaidServices.forEach(service => {
      result += `<li>${service}</li>`;
    });
    result += '</ul>';
  }
});


Object.keys(checksByMonth).forEach(month => {
  const monthFolder = `./${month}`;
  if (!fs.existsSync(monthFolder)) {
    fs.mkdirSync(monthFolder);
  }
  checksByMonth[month].forEach(check => {
    fs.renameSync(check, `${monthFolder}/${check}`);
  });
});


let unpaidServicesByMonth = {};
Object.keys(checksByMonth).forEach(month => {
  const unpaidServices = ['газоснабжение', 'ГВС', 'домофон', 'капремонт', 'квартплата', 'ТБО', 'теплоснабжение', 'ХВС', 'электроснабжение'].filter(service => !isMonthPaid(month, [service]));
  if (unpaidServices.length > 0) {
    unpaidServicesByMonth[month] = unpaidServices;
  }
});


let output = '';
Object.keys(checksByMonth).forEach(month => {
  checksByMonth[month].forEach(check => {
    output += `/${month}/${check}\n`;
  });
});
output += 'не оплачены:\n';
Object.keys(unpaidServicesByMonth).forEach(month => {
  output += `${month}:\n`;
  unpaidServicesByMonth[month].forEach(service => {
    output += `${service}\n`;
  });
});

fs.writeFileSync('чеки_по_папкам.txt', output);

document.write(`<h1>Файл чеки_по_папкам.txt:</h1>${result}`);