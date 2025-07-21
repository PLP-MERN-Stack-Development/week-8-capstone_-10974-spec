import validator from 'validator';
import bcrypt from 'bcrypt';
import {v2 as cloudinary} from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken';
import appointmentModel from '../models/appointmentModel.js';
import userModel from "../models/userModel.js";

// API FOR ADDING DOCTOR
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality,degree, experience,about, fees, address } = req.body;
        const imageFile = req.file;

    //  checking for all data to add doctor 

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile) {
            return res.status(400)({success: false, message: 'All fields are required'});
        }

        //  validating email format 

        if (!validator.isEmail(email)) {
            return res.status({success: false, message: 'Invalid email format'});
        }
        
        // validating password strength 

       if (password.length === 0) {
    return res.status(400).json({ success: false, message: 'Please enter a strong password' });
}


        // hashing password

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        //  upload image to cloudinary

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: 'image'});
        const imageUrl = imageUpload.secure_url;

        // create doctor object

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword, 
            speciality,
            degree,
            experience,
            about,
            fees,
            address:JSON.parse(address),
            date:Date.now(),
        } 

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({
            success: true,
            message: 'Doctor added successfully',
            doctor: newDoctor,
        });


    }catch(error) {
        console.log(error);
        res.json({
            success: false,
            message:error.message,
        });
    }

}

// API FOR THE ADMIN LOGIN 

const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {

            const token = jwt.sign(email+password, process.env.JWT_SECRET);
            res.json({
                success: true,
                token, 
            })   
        }else{
            res.json({
                success: false,
                message: 'Invalid credentials',
            })
        }

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message:error.message,
        });
    }
}

// API TO GET ALL THE DOCTORS FOR ADMIN PANEL

const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password');
        res.json({
            success: true,
            doctors,
        })
     


    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message:error.message,
        });
    }
}


// API TO GET ALL APPOINTMENTS LIST FOR ADMIN PANEL

const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({});
        res.json({
            success: true,
            appointments,
        })  
        
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message:error.message,
        });
    }
}

// API FOR APPOINTMENTS CANCELATION 

const appointmentCancel = async (req, res) => {
  try {

    const { appointmentId,  } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    // REMOVE SLOT FROM DOCTOR DATA
    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);
    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);

    await doctorModel.findByIdAndUpdate(docId, {
      slots_booked,
    })
    res.json({
      success: true,
      message: "Appointment cancelled successfully",
    })

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    })
  }
}

// API TO GET  DASHBOARD DATA FOR ADMIN PANEL 

const adminDashboard = async (req, res )=> {
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }
        res.json({success:true, dashData})

    }catch (error){
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard  };