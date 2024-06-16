const _ = require('lodash');

// Sample student data
const students = [
  { name: 'Alexandra', gender: 'Female', classLevel: '4. Senior', homeState: 'CA', major: 'English', extracurricularActivity: 'Drama Club', dues: 2000 },
  { name: 'Andrew', gender: 'Male', classLevel: '1. Freshman', homeState: 'SD', major: 'Math', extracurricularActivity: 'Lacrosse', dues: 4000 },
  { name: 'Anna', gender: 'Female', classLevel: '1. Freshman', homeState: 'NC', major: 'English', extracurricularActivity: 'Basketball', dues: 500 },
  { name: 'Becky', gender: 'Female', classLevel: '2. Sophomore', homeState: 'SD', major: 'Art', extracurricularActivity: 'Baseball', dues: 3590 },
  { name: 'Benjamin', gender: 'Male', classLevel: '4. Senior', homeState: 'WI', major: 'English', extracurricularActivity: 'Basketball', dues: 2000 },
  { name: 'Carl', gender: 'Male', classLevel: '3. Junior', homeState: 'MD', major: 'Art', extracurricularActivity: 'Debate', dues: 4000 },
  { name: 'Carrie', gender: 'Female', classLevel: '3. Junior', homeState: 'NE', major: 'English', extracurricularActivity: 'Track & Field', dues: 500 },
  { name: 'Dorothy', gender: 'Female', classLevel: '4. Senior', homeState: 'MD', major: 'Math', extracurricularActivity: 'Lacrosse', dues: 3590 },
  { name: 'Dylan', gender: 'Male', classLevel: '1. Freshman', homeState: 'MA', major: 'Math', extracurricularActivity: 'Baseball', dues: 2000 },
  { name: 'Edward', gender: 'Male', classLevel: '3. Junior', homeState: 'FL', major: 'English', extracurricularActivity: 'Drama Club', dues: 4000 },
  { name: 'Ellen', gender: 'Female', classLevel: '1. Freshman', homeState: 'WI', major: 'Physics', extracurricularActivity: 'Drama Club', dues: 500 },
  { name: 'Fiona', gender: 'Female', classLevel: '1. Freshman', homeState: 'MA', major: 'Art', extracurricularActivity: 'Debate', dues: 3590 },
  { name: 'John', gender: 'Male', classLevel: '3. Junior', homeState: 'CA', major: 'Physics', extracurricularActivity: 'Basketball', dues: 2000 },
  { name: 'Jonathan', gender: 'Male', classLevel: '2. Sophomore', homeState: 'SC', major: 'Math', extracurricularActivity: 'Debate', dues: 4000 },
  { name: 'Joseph', gender: 'Male', classLevel: '1. Freshman', homeState: 'AK', major: 'English', extracurricularActivity: 'Drama Club', dues: 500 },
];

// Handle different types of queries
function handleRequest(req, res) {
  const queryResult = req.body.queryResult;
  const queryText = queryResult.queryText;

  let responseText = '';

  switch (queryText) {
    case 'Get Students By Activity':
      const activity = queryResult.parameters['extracurricularActivity'];
      const studentsByActivity = students.filter(student => student.extracurricularActivity === activity);
      responseText = `Students in ${activity}: ${studentsByActivity.map(student => student.name).join(', ')}. Total: ${studentsByActivity.length}`;
      break;

    case 'Get Highest Dues':
      const highestDuesStudent = _.maxBy(students, 'dues');
      responseText = `Student with highest dues is ${highestDuesStudent.name} with dues of ${highestDuesStudent.dues}.`;
      break;

    case 'Get Students By State':
      const state = queryResult.parameters['homeState'];
      const studentsByState = students.filter(student => student.homeState === state);
      responseText = `Students from ${state}: ${studentsByState.map(student => student.name).join(', ')}. Total: ${studentsByState.length}`;
      break;

    case 'Get Students By State And Major':
      const stateAndMajor = queryResult.parameters['homeState'];
      const major = queryResult.parameters['major'];
      const studentsByStateAndMajor = students.filter(student => student.homeState === stateAndMajor && student.major === major);
      responseText = `Students from ${stateAndMajor} majoring in ${major}: ${studentsByStateAndMajor.map(student => student.name).join(', ')}. Total: ${studentsByStateAndMajor.length}`;
      break;

    case 'Get Total Dues':
      const totalDues = _.sumBy(students, 'dues');
      responseText = `The total dues for all students are ${totalDues}.`;
      break;

    default:
      responseText = 'Sorry, I did not understand your request.';
  }

  res.json({
    fulfillmentText: responseText,
  });
}

module.exports = {
  handleRequest,
};
