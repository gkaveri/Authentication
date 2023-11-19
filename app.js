const express = require('express');
const {open}= require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname,'userData.db');

const db = null;
const app = express();
app.use(express.json());

const initializeDbAndServer = async ()=>{
    try{
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () =>
            console.log('Server Running at https://localhost:3000/')
        );
    }catch (error){
        console.log(`DB Error: ${error.message}`);
        process.exit(1)
    }
}

initializeDbAndServer();

const validatePassword = (password) => {
    return password.length > 4;
};

app.post('/register', async (request, response) =>{
    const {username, name, password, gender, location} = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'; `;
    const dbUser = await db.get(selectUserQuery);

    if(dbUser === undefined){
        const creatUserQuery = `
            INSERT INTO user VALUES('${username}','${name}','${hashedPassword}','${gender}','${location}');`;
                if(validatePassword(password)){
                    await db.run(creatUserQuery);
                    response.send('User created successfully');
                }else{
                    response.status(400);
                    response.send('Password is too short');
                }
    }else{
        response.status(400);
        response.send('User already exists');
    }
});

app.post('/login', async (request, response) => {
    const {username, password} = request.body;
    const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
    const dbUser = await db.get(selectUserQuery);

    if(dbUser === undefined){
        response.status(400);
        response.send('Invalid User');
    }else{
        const isPassword = await bcrpty.compare(password, dbUser.password);
        if(isPassword === true){
            response.send('Login success!');
        }else{
            response.status(400);
            response.status('Invalid password');
        }
    }
});

app.put('/change-password', async (request, response) => {
    const {username, oldPassword, newPassword} = request.body;
    const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
    const dbUser = await db.get(selectUserQuery);

    if(dbUser === undefined){
        response.status(400);
        response.send('Invalid user');
    }else{
        const isPasswordMatched = await bcrypt.compare(oldPassowrd, dbUser.password);
        if (isPasswordMatched === true){
            if(validatePassword(newpassword)){
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                const updatePasswordQuery = `UPDATE user SET password = '${hashedPassword}'
                                                     WHERE username = '${username}';`;
                const user = await db.run(updatePasswordQuery);
                response.send('Password updated');
            }else{
                response.status(400);
                response.send('Password is too short');
            }
        }else{
            response.status(400);
            response.send('Invalid current password');
        }
    }
});

module.exports = app;