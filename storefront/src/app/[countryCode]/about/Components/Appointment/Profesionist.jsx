import React from 'react'
import {AiFillCheckCircle} from 'react-icons/ai'
const Profesionist = ({photo,namePro,onClick,selected,artistPhoto}) => {
  return (
    <div onClick={onClick} className='flex flex-col items-center h-full  gap-2'>
        <div className={`cursor-pointer relative flex items-center justify-center bg-gray-200 w-[90px] lg:w-[150px] h-[90px] lg:h-[150px] rounded-[50%] ${selected && "border-[1px] border-green-600"}`} >
          <img className='rounded-[100%] w-full h-full' src={artistPhoto} />
          <span className={`${!selected && "hidden"} absolute top-0 left-0 rounded-[50%] w-full h-full bg-black bg-opacity-[20%]`}/>
          <span className={`${!selected && "hidden"} absolute  z-20 text-green-400 text-[28px] lg:text-[48px]`}><AiFillCheckCircle />

          </span>
          </div>
          <div className='flex flex-col'>
            <h3 className='font-bold text-gray-600 text-[14px] lg:text-[20px]'>{namePro}{namePro=="Catalina" && <span className="font-thin">-Sprancene</span>} </h3>
            <p className={`text-[12px] lg:text-[16px] ${namePro!=="Gabriela" && "hidden"}`}>Sprancene + Gene</p>

          </div>
    </div>
  )
}

export default Profesionist