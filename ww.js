let temp = -20;
let min = false;
let tempPerDay = 0.28;

for (let day = 0; day <= 365; day++) {
    if (temp > 30) {
        min = true;
    }

    if (min) temp -= tempPerDay;
    else temp += tempPerDay;
    console.log(Math.round(temp) + ', '+day)
}
