import { createContext } from "react";

export const AppContext = createContext()

const AppContextProvider = (props) => {
     const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const currency = '$'

    const calculateAge = (dob) =>{
        const today = new Date()
        const birthDate = new Date(dob)

        let age = today.getFullYear() - birthDate.getFullYear()
        return age
    }

     const month = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]

  const slotDateFormat = (slotDate) => {
    const dataArray = slotDate.split('-')
    return dataArray[0] + ' ' + month[Number(dataArray[1]) - 1] +'' + dataArray[2]
  }

    const value = {
        calculateAge,
        slotDateFormat,
        currency,
        backendUrl
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider