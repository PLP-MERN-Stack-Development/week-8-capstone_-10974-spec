import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";
// API TO REGISTER USER

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // VALIDATING EMAIL

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Enter A valid email" });
    }

    // validating password

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    // save user to db

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API FOR USER LOGIN

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User does not exist",
      });
    }
    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({
        success: true,
        message: "User logged in successfully",
        token,
      });
    } else {
      res.json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API TO GET USER PROFILE DATA

const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId).select("-password");
    res.json({
      success: true,
      userData,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API TO UPDATE USER PROFILE DATA

const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !address || !dob || !gender) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      //  UPLOAD IMAGE TO CLOUDINARY
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      })
      const imageUrl = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, {
        image: imageUrl,
      });


    }

    res.json({
      success: true,
      message: "Profile updated successfully",
    });

    const userData = await userModel.findById(userId);
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API TO BOOK APPOINTMENT 


const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime, } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.json({
        success: false,
        message: "Doctor is not available",
      });
    }

    let slots_booked = docData.slots_booked;

    // checking for slots availability 

    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({
          success: false,
          message: "Slot is not available",
        });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      slotDate,
      slotTime,
      userData,
      docData,
      amount: docData.fees,
      date: Date.now(),
    };
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();


    // SAVE NEW SLOTS DATA IN DOCTORS DATA 
    await doctorModel.findByIdAndUpdate(docId, {
      slots_booked,
    });
    res.json({
      success: true,
      message: "Appointment booked successfully",
    });


  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
}

// API TO GET APPOINTMENTS OF USER
const listAppointment = async (req, res) => {
  try {

    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });
    res.json({
      success: true,
      appointments,
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    })
  }
}

// API TO CANCEL APPOINTMENT

const cancelAppointment = async (req, res) => {
  try {

    const { appointmentId, userId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData.userId !== userId) {
      return res.json({
        success: false,
        message: "You are not authorized to cancel this appointment",
      })
    }
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

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})


// API to make payment of appointment using razorpay 

const paymentRazorpay = async (req, res) => {

  try {
    
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);


    if (!appointmentData || appointmentData.cancelled) {
      return res.json({
        success: false,
        message: "Appointment does not exist",
      })
    }

    // creating options for razor pay payment 
    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    }

    // creating order for razor pay payment
    const order = await razorpayInstance.orders.create(options);
    res.json({
      success: true,
      order,
    })

  }
  catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    })
  }
}


export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay };