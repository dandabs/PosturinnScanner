const axios = require('axios').default;
var fs = require('fs')

//const trackingid = "UB192791566gb";

function getCheckDigit(num) {
    const weights = [8, 6, 4, 2, 3, 5, 9, 7];
    const numArr = Array.from(String(num), Number);
    let sum = 0;
    numArr.forEach((n, i) => sum = sum + (n * weights[i]));
    sum = 11 - (sum % 11);
    if (sum == 10) sum = 0;
    else if (sum == 11) sum = 5;
    return sum;
}

console.log("Ready");
//doCheckLoop("CG", 409575, 409730); // FIRST TIME 12/07 INTL PARCEL TIL LAST VALID 13/07
doCheckLoop("RG", 83802, 83923); // FIRST TIME 12/07 INTL LETTER TIL LAST VALID 13/07

// 155 + 121 = 276 possible from any location

async function doCheckLoop(code, start, until) {
    for (var i = start; i <= until; i++) {
        var tCode = code;
        var tId = i.toPrecision(8).split('.').reverse().join('');
        var tCheck = getCheckDigit(tId);
        var tCountry = "IS";
        var trackingid = tCode + tId + tCheck + tCountry;
        //console.log(trackingid);

        const response = await axios({
            method: 'get',
            url: `https://api.mobiz.posturinn.is/api/v1/shipments/${trackingid}`,
        });

        if (response.data.shipment != undefined) {
            if (response.data.shipment.direction == "Outbound" &&
            response.data.shipment.status != "Delivered") {
                console.log(`${trackingid} valid and fits requirements.`)
                try {
                    if (response.data.trackingEvents[0].location.name == "Pósthús Akureyri") fs.appendFile('aku.csv', `\r${response.data.shipment.id},${response.data.shipment.deliveryServiceId},${response.data.trackingEvents[0].timestamp},${response.data.trackingEvents[0].location.name}`, function (err) {})
                    } catch (ex) {
                        try {
                            fs.appendFile('aku.csv', `\r${response.data.shipment.id},${response.data.shipment.deliveryServiceId},na,na`, function (err) {})
                        } catch (ex2) {
                            console.log(ex);
                        }
                    }
            } else {
                console.log(`${trackingid} valid but does not fit requirements.`)
            }
        } else {
            console.log(`${trackingid} invalid. checked ${i}.`);
        }
    
    }
}
