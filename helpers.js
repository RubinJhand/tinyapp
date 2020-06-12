//Search for entered user email
const getUserByEmail = (usersObject, enteredUserEmail) => {

  for (let user in usersObject) {
    
    if (usersObject[user].email === enteredUserEmail) {

      return usersObject[user];
    }
  }
  return false;

};

module.exports = { getUserByEmail };