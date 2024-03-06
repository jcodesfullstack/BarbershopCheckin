import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import methodOverride from 'method-override';

// Define a schema
const Schema = mongoose.Schema;

const CheckInSchema = new Schema({
  barberName: { type: String, required: true },
  clientName: { type: String, required: true },
  clientNumber: { type: String, required: true },
  haircutType: { type: String, required: true },
  checkInTime: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
  serviceStartTime: { type: Date }
});

// Compile model from schema
const CheckIn = mongoose.model('CheckIn', CheckInSchema);

dotenv.config();

// MongoDB Connection
const mongoDB = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/BarberShop_SMS_List';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));



const app = express();
const PORT = process.env.PORT || 3000;  

// Set EJS as the view engine
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));

app.get("/", (req, res) => {
    const barbers = [   
        { id: 'jelo', name: 'Jelo' },
        { id: 'vince', name: 'Vince' },
        { id: 'xavier', name: 'Xavier' },
        { id: 'Gonzo', name: 'Gonzo' },
        { id: 'cesar', name: 'Cesar' },
        { id: 'jblurry', name: 'Jblurry' }
    ];
    res.render("index", { barbers });
});

app.post("/check-in", async (req, res) => {
    const newCheckIn = new CheckIn({
        barberName: req.body.barberName,
        clientName: req.body.clientName,
        clientNumber: req.body.clientNumber,
        haircutType: req.body.haircutType
    });

    try {
        await newCheckIn.save();
        res.json({ message: "Check-in successful" });
    } catch (err) {
        console.error('Error saving check-in:', err);
        res.status(500).json({ error: "Error saving check-in." });
    }
});

app.get("/admin/check-ins", async (req, res) => {
    try {
        const checkIns = await CheckIn.find().sort({ checkInTime: -1 });
        res.render("adminCheckIns", { checkIns });
    } catch (error) {


console.error("Error fetching check-ins: ", error);

        res.status(500).send('Error fetching check-ins');
    }
});



app.get("/admin/check-ins/delete/:id", async (req, res) => {
    try {

        await CheckIn.findByIdAndDelete(req.params.id);
        res.redirect('/admin/check-ins');
    } catch (error) {
        console.error('Error deleting check-in:', error);
        res.status(500).send('Error deleting check-in');
    }
});



app.get("/admin/check-ins/start/:id", async (req, res) => {
    try {
        await CheckIn.findByIdAndUpdate(req.params.id, {
            status: 'in-progress',
            serviceStartTime: new Date()
        });
        res.redirect('/admin/check-ins');
    } catch (error) {
       
        console.error('Error starting check-in:', error);
        res.status(500).send('Error updating check-in status');
    }
});

app.get("/admin/check-ins/complete/:id", async (req, res) => {
    try {
        await CheckIn.findByIdAndUpdate(req.params.id, { status: 'completed' });
        res.redirect('/admin/check-ins');
    } catch (error) {
        
        console.error('Error completing check-in:', error);
        res.status(500).send('Error updating check-in status');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
