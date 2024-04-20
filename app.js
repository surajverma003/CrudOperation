
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const EmpSchema = require('./EmpSchema');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config()
const app = express();

const REACT_APP_DATABASE = process.env.REACT_APP_DATABASE;
const SecretKey = process.env.REACT_APP_SECRET_KEY;

mongoose.connect(REACT_APP_DATABASE).then(() => console.log('connected successfully')).catch((error) => {
    console.log('disconnected : ' + error)
});

app.use(cors());
app.use(express.json());



// ROUTE 1 : Create Employee 
app.post('/create-emp', async (request, response) => {
    try {
        const user = await EmpSchema.findOne({ email: request.body.email });
        if (user) {
            return response.json({ data: "User already exists !!" });
        }

        const emp = new EmpSchema(request.body);
        await emp.save();
        response.json({ data: "Data registered successfully !!" });
    } catch (error) {
        response.json({ data: "Data not registered !!" });
    }
});



// ROUTE 2 : Fetch All Employees Data with Pagination
app.get('/get-all-data', async (request, response) => {
    const page = parseInt(request.query._page) || 1; // Default to page 1 if not provided
    const limit = parseInt(request.query.limit) || 5; // Default to limit 5 if not provided

    try {
        const totalEmployees = await EmpSchema.countDocuments();
        const totalPages = Math.ceil(totalEmployees / limit);
        const skip = (page - 1) * limit;

        const employees = await EmpSchema.find().skip(skip).limit(limit);

        response.json({
            currentPage: page,
            totalPages: totalPages,
            totalEmployees: totalEmployees,
            employees: employees
        });
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
});



// ROUTE 3 : Fetch All Employee
app.get('/employees', async (request, response) => {
    const employees = await EmpSchema.find();
    response.json(employees);
});



// ROUTE 4 : Fetch Single Employee Data by ID
app.get('/get-one-data/:id', async (request, response) => {
    const emp = await EmpSchema.findById(request.params.id);
    response.json(emp);
});



// ROUTE 5 : Fetch Single Employee Data by Email
app.get('/get-one-data2/:email', async (request, response) => {
    console.log(request.params.id);

    const emp = await EmpSchema.findOne({ email: request.params.email })
    if (!emp) {
        return response.json({ error: "Data not Found !!" });
    }
    response.json(emp);
});



// ROUTE 6 : Fetch User using auth token
app.post('/getuser', async (request, response) => {

    const token = request.header("token");
    let success = false;

    if (token === 'null') {
        success = false;
        return response.json({ success, data: 'Please authenticate using a valid token' });
    }

    const data = jwt.verify(token, SecretKey);
    success = true;
    response.json({ success, data });
});





// ROUTE 7 : Delete Employee Data
app.delete('/deleteemp/:id', async (request, response) => {
    try {
        const emp = await EmpSchema.findByIdAndDelete(request.params.id);
        response.json({ data: "Data deleted successfully !!" });
    } catch (error) {
        response.json({ data: "Data not deleted !!" });
    }
});

// ROUTE 8 : Update Employee Data
app.put('/updateemp/:id', async (request, response) => {
    const { empname, email, password } = request.body;

    try {
        const newEmp = {};
        if (empname) { newEmp.empname = empname };
        if (email) { newEmp.email = email };
        if (password) { newEmp.password = password };

        const emp = await EmpSchema.findByIdAndUpdate(request.params.id, newEmp, { new: true });
        response.json({ data: "Updated successfully !!" });
    } catch (error) {
        response.json({ data: "Not Updated !!" });
    }
});



// ROUTE 9 : Login User
app.post('/login', async (request, response) => {
    const { email, password } = request.body;

    const user = await EmpSchema.findOne({ email: email });
    let success = false;

    if (!user) {
        success = false;
        return response.json({ success, data: "User doesn't exists" });
    }

    if (user.password !== password) {
        success = false;
        return response.json({ success, data: "email or password is incorrect !!" });
    }

    success = true;
    const authtoken = jwt.sign({ user }, SecretKey);
    response.json({ success, authtoken: authtoken, data: "Login successfull !!", user: user });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});