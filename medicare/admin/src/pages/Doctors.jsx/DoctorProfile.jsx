import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const { dToken, profileData, getProfileData, setProfileData } =
    useContext(DoctorContext);
  const { currency, backendUrl } = useContext(AppContext);
    useEffect(() => {
    console.log("Current backendUrl:", backendUrl);
  }, []);

  const [isEdit, setIsEdit] = useState(false);

  const updateProfile = async () => {
    try {
     const updateData = {
       fees: profileData.fees,
       available: profileData.available,
       address: profileData.address
     }
     const {data} = await axios.put(backendUrl + '/api/doctor/update-profile', updateData, {headers:{dToken}})
     if(data.success){
      toast.success(data.message)
      setIsEdit(false)
      getProfileData()
     } else {
      toast.error(data.message)
     }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);


  const handleFeeChange = (e) => {
    setProfileData(prev => ({
      ...prev,
      fees: e.target.value
    }));
  };

  return (
    profileData && (
      <div>
        <div className="flex flex-col gap-4 m-5">
          <div>
            <img
              className="bg-primary/80 w-full sm:max-w-64 rounded-lg"
              src={profileData.image}
              alt=""
            />
          </div>
          <div className="flex-1 border-stone-100 rounded-lg p-8 py-7 bg-white">
            {/* ==== DOC INFO NAME DEGREE AND EXPERIENCE====== */}
            <p className="flex items-center text-3xl font-medium text-gray-700 ">
              {profileData.name}
            </p>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <p>
                {profileData.degree} - {profileData.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {profileData.experience}
              </button>
            </div>
            {/* =========DOCTOR ABOUT========  */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-neutral-800 mt-3">
                About:
              </p>
              <p className="text-sm text-gray-600 max-w-[700px] mt-1">
                {profileData.about}
              </p>
            </div>

            <p className="text-gray-600 font-medium mt-4">
              Appointment Fee:{" "}
              <span className="text-gray-600">
                {currency} {isEdit ? (
                  <input 
                    type="number" 
                    onChange={handleFeeChange} 
                    value={profileData.fees} 
                    className="w-20 border rounded px-2"
                  />
                ) : profileData.fees}
              </span>
            </p>
            <div className="flex gap-2 py-2">
              <p className="text-sm">Address:</p>
              <p>
                { isEdit ? <input type="text" onChange={(e)=>setProfileData(prev => ({...prev,address:{...prev.address,line1:e.target.value}}))} value={profileData.address.line1} /> :profileData.address.line1}
                <br />
                { isEdit ? <input type="text" onChange={(e)=>setProfileData(prev => ({...prev,address:{...prev.address,line2:e.target.value}}))} value={profileData.address.line2} />  :profileData.address.line2}
              </p>
            </div>

            <div className="flex gap-1 pt-2">
              <input 
                type="checkbox" 
                checked={profileData.available} 
                onChange={()=>isEdit && setProfileData(prev => ({...prev, available: !prev.available}))}
                id="availability-checkbox"
              />
              <label htmlFor="availability-checkbox">Available</label>
            </div>

            {
              isEdit 
              ?     <button 
              onClick={updateProfile} 
              className="px-4 py-1 border border-primary text-sm rounded-full mt-5 cursor-pointer hover:bg-primary hover:text-white transition-all duration-300"
            >Save</button>
            :         
             <button 
              onClick={() => setIsEdit(true)} 
              className="px-4 py-1 border border-primary text-sm rounded-full mt-5 cursor-pointer hover:bg-primary hover:text-white transition-all duration-300"
            >Edit</button>
              
            }
  
       
          </div>
        </div>
      </div>
    )
  );
};

export default DoctorProfile;