var https = require('https');

module.exports = function(quoteType, currentAge, fund, cashPercentage, callback) {
  var serviceQuoteType = quoteType === 'flexible' ? 'SustainableIncome' : 'GuaranteedIncome';
  var requestBody = {
    "operation": serviceQuoteType,
    "currentAge": currentAge,
    "fund": fund,
    "cashPercentage": cashPercentage,
    "giSpousePercentage": '0',
    "giGuaranteePeriod": '5',
    "giEscalation": '0',
    "fiEndAge": '90',
    "fiAnnualIncome": '0',
    "fiFundGrowthRate": '5',
    "fiEscalation": '0',
    "source": "RetirementIncomeCalc"
  };
  var req = https.request({
    host: 'calc.pru.co.uk',
    port: '443',
    path: '/ctc-int/ctcServlet/pruCalc/calculateRetirement',
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'Host': 'calc.pru.co.uk',
      'Origin': 'https://www.pru.co.uk'
    }
  }, function(httpResponse) {
    var serviceResponseText = "",
        response = {};
    httpResponse.setEncoding('utf8');
    //console.log('statusCode:', httpResponse.statusCode);
    //console.log('headers:', httpResponse.headers);

    httpResponse.on('data', function(d) {
      serviceResponseText += d;
    });

    httpResponse.on('end', function() {
      serviceReturn = JSON.parse(serviceResponseText);
      response = {
        quoteType: quoteType,
        grossIncome: quoteType === 'flexible' ? serviceReturn.fiIncomeArray[1] : serviceReturn.giIncomeArray[1],
        netIncome: quoteType === 'flexible' ? serviceReturn.fiNetIncomeArray[1] : serviceReturn.giNetIncomeArray[1],
        cashAmount: serviceReturn.cashAmount,
        cashTax: serviceReturn.taxCash
      };/*
      if (quoteType === 'flexible') {
        response.flexibleEndAge = serviceReturn.fiEndAge;
      }*/
      callback(null, response);
    });
  });
  req.write(JSON.stringify(requestBody));
  req.end();
};
