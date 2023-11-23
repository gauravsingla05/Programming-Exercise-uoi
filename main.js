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
  // Object to store the counts of completed trainings
  const trainingCounts = {};

  // Loop through each person's completions in the data
  data.forEach((person) => {
    // Temporary map to store the most recent completion date for each training
    let trainMap = {};

    // Loop through each completion for the current person
    person.completions.forEach((completion) => {
      const trainingName = completion.name;
      const completionDate = new Date(completion.timestamp);

      // If the training is not in the map, add it with the completion date
      if (!trainMap[trainingName]) {
        trainMap[trainingName] = completionDate;
      } else {
        // If the training is already in the map, update with the most recent completion date
        if (trainMap[trainingName] < completionDate) {
          trainMap[trainingName] = completionDate;
        }
      }
    });

    // Count the unique completed trainings for the current person
    for (let e in trainMap) {
      if (!trainingCounts[e]) {
        trainingCounts[e] = 1;
      } else {
        trainingCounts[e] = trainingCounts[e] + 1;
      }
    }
  });

  // Output the result to a JSON file
  const output1 = {
    task: 'Completed Trainings Count',
    data: trainingCounts,
  };

  fs.writeFileSync('output1.json', JSON.stringify(output1, null, 2));
}

// Task 2: List people who completed specific trainings in a specified fiscal year.
function completedTrainingsInFiscalYear(data, trainings, fiscalYear) {
  // Initialize an object to store the results
  const results = {};

  // Define the start and end dates of the fiscal year
  const fiscalYearStart = new Date(`${fiscalYear - 1}-07-01T00:00:00Z`);
  const fiscalYearEnd = new Date(`${fiscalYear}-06-30T23:59:59.999Z`);

  // Iterate through each person in the data
  data.forEach((person) => {
    // Initialize a temporary map to track the most recent completion date for each training
    const trainMap = {};

    // Iterate through each completion for the current person
    person.completions.forEach((completion) => {
      const trainingName = completion.name;
      const completionDate = new Date(completion.timestamp);

      // Check if the training is in the specified list and not yet recorded in trainMap
      if (trainings.includes(trainingName) && !trainMap[trainingName]) {
        trainMap[trainingName] = completionDate;
      } else {
        // If the training is in the list and there's already a recorded date, update if the new date is more recent
        if (trainings.includes(trainingName) && trainMap[trainingName] < completionDate) {
          trainMap[trainingName] = completionDate;
        }
      }
    });

    // Iterate through the recorded training dates in trainMap
    for (let res in trainMap) {
      let latestDate = trainMap[res];

      // Check if the latest completion date falls within the fiscal year
      if (latestDate >= fiscalYearStart && latestDate <= fiscalYearEnd) {
        // If the training doesn't have an entry in results, create one and add the person's name
        if (!results[res]) {
          results[res] = [];
          results[res].push(person.name);
        } else {
          // If the training already has an entry in results, add the person's name to the existing array
          results[res].push(person.name);
        }
      }
    }
  });

  // Create the output object
  const output2 = {
    task: `Completed Trainings between ${fiscalYear - 1}-07-01 and ${fiscalYear}-06-30`,
    data: results,
  };

  // Write the output to a JSON file
  fs.writeFileSync('output2.json', JSON.stringify(output2, null, 2));
}


//Task 3: List all people that have any completed trainings that have already expired, or will expire within one month of the specified date
function myfindExpiredTrainings(jsonData, currentDate) {
  // Convert the current date to a JavaScript Date object
  const givenDate = new Date(currentDate);

  // Initialize an empty object to store the final results
  const finalResults = {};

  // Calculate the date one month from the given date
  const oneMonthFromNow = new Date(givenDate);
  oneMonthFromNow.setMonth(givenDate.getMonth() + 1);

  // Iterate over each person in the JSON data
  jsonData.forEach(person => {
    // Extract the person's name
    const personName = person.name;

    // Extract the completed trainings for the person
    const completedTrainings = person.completions;

    // Initialize an empty map to store the most recent expiration date for each training
    trainMap = {};

    // Iterate over each completed training for the person
    completedTrainings.forEach(training => {
      // Extract the training name and expiration date (if available)
      const trainingName = training.name;
      const expirationDate = training.expires ? new Date(training.expires) : null;

      // Update the trainMap with the most recent expiration date for each training
      if (expirationDate && !trainMap[trainingName]) {
        trainMap[trainingName] = expirationDate;
      } else {
        if (expirationDate && trainMap[trainingName] < expirationDate) {
          trainMap[trainingName] = expirationDate;
        }
      }
    });

    // Iterate over the entries in the trainMap
    for (let res in trainMap) {
      // Extract the latest expiration date for the training
      let latestExpiryDate = trainMap[res];

      // Check if the training is expired or expires soon
      if (latestExpiryDate < givenDate || latestExpiryDate < oneMonthFromNow) {
        let alreadyExpired = latestExpiryDate < givenDate;
        let expiringSoon = latestExpiryDate < oneMonthFromNow;

        // Initialize an array for the person in the finalResults object if not present
        if (!finalResults[personName]) {
          finalResults[personName] = [];
        }

        // Push the details of the expired or expiring 
        finalResults[personName].push({
          name: res,
          expired: alreadyExpired ? true : false,
          expiresSoon: !alreadyExpired && expiringSoon ? true : false
        });
      }
    }
  });

  // Prepare the output structure
  const output3 = {
    task: `Expired or Expires Soon Trainings on ${currentDate}`,
    data: Object.entries(finalResults).map(([person, trainings]) => ({ person, trainings })),
  };

  // Write the output to a file named 'output3.json'
  fs.writeFileSync('output3.json', JSON.stringify(output3, null, 2));
}




console.log('Output files saved: output1.json, output2.json, output3.json');
