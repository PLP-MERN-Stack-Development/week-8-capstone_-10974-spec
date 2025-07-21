import React from 'react'
import { assets } from '../assets/assets_frontend/assets'

const Footer = () => {
    return (
        <div className='md:mx-10 '>
            <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
                {/* =========LEFT SECTION======== */}
                <div>
                    <img className='mb-5 w-40' src={assets.logo} alt="" />
                    <p className='w-full md:w-2/3 text-gray-600 leading-6'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>

                {/* =========CENTER SECTION======== */}
                <div>
                    <p className='text-xl font-medium mb-5'>Company</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li className='hover:text-blue-600 cursor-pointer'>Home</li>
                        <li className='hover:text-blue-600 cursor-pointer'>About us</li>
                        <li className='hover:text-blue-600 cursor-pointer'>Contact us</li>
                        <li className='hover:text-blue-600 cursor-pointer'>Privacy Policy</li>
                    </ul>
                </div>

                {/* =========RIGHT SECTION======== */}
                <div>
                    <p className='text-xl font-medium mb-5'>Get In Touch</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li>+254 117041805</li>
                        <li>growinai254@gmail.com</li>
                    </ul>
                </div>


            </div>
            {/*     ======COPYRIGHT TEXT=======  */}
            <div>
                <hr />
                <p className='py-5 text-sm text-center'>Copyright ©2024 Medicare - All Right Reserved </p>
            </div>
        </div>
    )
}

export default Footer
