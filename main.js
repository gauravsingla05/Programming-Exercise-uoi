const fs = require('fs');

// Read the JSON data from the file
let trainingData;

try {
  const rawData = fs.readFileSync('trainings.txt');
  trainingData = JSON.parse(rawData);
} catch (error) {
  console.error('Error reading or parsing the JSON file:', error.message);
  return
}




// Execute the tasks
countCompletedTrainings(trainingData);
completedTrainingsInFiscalYear(trainingData, ["Electrical Safety for Labs", "X-Ray Safety", "Laboratory Safety Training"], 2024);
myfindExpiredTrainings(trainingData, 'oct 1 2023');



// Task 1: List each completed training with a count of how many people have completed that training.
function countCompletedTrainings(data) {
  const trainingCounts = {};
  
  data.forEach((person) => {
 
    let trainMap={};
    person.completions.forEach((completion) => {
      const trainingName = completion.name;
      const completionDate = new Date(completion.timestamp)
      
      if (!trainMap[trainingName]) {
        trainMap[trainingName] = completionDate;
      
      }
      else{
        if(trainMap[trainingName]<completionDate){
          trainMap[trainingName] = completionDate;
        }
      }
  

    });
    
    for (let e in trainMap) {
       
      if(!trainingCounts[e]){
        trainingCounts[e]=1
      }
      else{
        trainingCounts[e] = trainingCounts[e]+1
      }
    }
  
  });

  const output1 = {
    task: 'Completed Trainings Count',
    data: trainingCounts,
  };

  fs.writeFileSync('output1.json', JSON.stringify(output1, null, 2));
}

// Task 2: List people who completed specific trainings in a specified fiscal year.
function completedTrainingsInFiscalYear(data, trainings, fiscalYear) {
  const results = {};
  const fiscalYearStart = new Date(`${fiscalYear - 1}-07-01T00:00:00Z`);

 
  const fiscalYearEnd = new Date(`${fiscalYear}-06-30T23:59:59.999Z`);

  data.forEach((person) => {
    trainMap={}
    person.completions.forEach((completion) => {
      const trainingName = completion.name;
      const completionDate = new Date(completion.timestamp);
       
      if (trainings.includes(trainingName) && !trainMap[trainingName]) {
        trainMap[trainingName] = completionDate;
      
      }
      else{
        if(trainings.includes(trainingName) && trainMap[trainingName]<completionDate){
          trainMap[trainingName] = completionDate;
        }
      }

   
    });
    for (let res in trainMap) {
      let latestDate = trainMap[res]

      if(latestDate>=fiscalYearStart && latestDate<=fiscalYearEnd){
        
          if (!results[res]) {
            results[res] = [];
            results[res].push(person.name);
          }
          else{
            results[res].push(person.name);
          }
          
      }

    }
    
  

  });

  const output2 = {
    task: `Completed Trainings between ${fiscalYear - 1}-07-01 and ${fiscalYear}-06-30`,
    data: results,
  };

  fs.writeFileSync('output2.json', JSON.stringify(output2, null, 2));
}


//Task 3: List all people that have any completed trainings that have already expired, or will expire within one month of the specified date
function myfindExpiredTrainings(jsonData, currentDate) {
  const givenDate = new Date(currentDate);
  const finalResults = {};
   console.log(givenDate)
  const oneMonthFromNow = new Date(givenDate);
  oneMonthFromNow.setMonth(givenDate.getMonth() + 1);



  jsonData.forEach(person => {
    const personName = person.name;
    const completedTrainings = person.completions;
    trainMap={}
    completedTrainings.forEach(training => {
      const trainingName = training.name
      const expirationDate = training.expires ? new Date(training.expires) : null;

      if (expirationDate && !trainMap[trainingName]) {
        trainMap[trainingName] = expirationDate;
      
      }
      else{
        if(expirationDate && trainMap[trainingName]<expirationDate){
          trainMap[trainingName] = expirationDate;
        }
      }
    
    });
      for (let res in trainMap) {
        let latestExpiryDate = trainMap[res]

        if(latestExpiryDate<givenDate || latestExpiryDate<oneMonthFromNow){

          let alreadyExpired = latestExpiryDate<givenDate 
          let expiringSoon = latestExpiryDate<oneMonthFromNow

          if (!finalResults[personName]) {
            finalResults[personName] = [];
          }
          finalResults[personName].push({
            name: res,
            expired: alreadyExpired ? true : false,
            expiresSoon: !alreadyExpired && expiringSoon ? true : false
          });
        }

      }
  });

  const output3 = {
    task: `Expired or Expires Soon Trainings on ${currentDate}`,
    data: Object.entries(finalResults).map(([person, trainings]) => ({ person, trainings })),
  };

  fs.writeFileSync('output3.json', JSON.stringify(output3, null, 2));
}









console.log('Output files saved: output1.json, output2.json, output3.json');
