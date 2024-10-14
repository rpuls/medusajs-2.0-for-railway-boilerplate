import React from 'react'
import {AiOutlineCheck} from 'react-icons/ai'
const Service = ({nameServ,price,duration,selected,onClick}) => {
  return (
    <div onClick={onClick} className={`my-1 flex items-center  justify-between w-full lg:w-[40rem] h-[2.5rem] lg:h-[4rem] cursor-pointer border-[2px]  p-1 lg:p-4 rounded-[8px] ${selected ? "border-green-600 bg-green-600 text-white" : "border-gray-300"}`}>
          <div className="flex items-center">
            <div className={`mr-2 lg:mr-4 flex items-center justify-center w-[18px] lg:w-[25px] h-[18px] lg:h-[25px] rounded-[50%] border-[1px]  ${selected ? "bg-green-400 border-green-400" : "border-gray-500"}`}>
                <span className={` ${!selected && "hidden" } text-[12px] lg:text-[18px] text-white`}><AiOutlineCheck /></span>
            </div>
            <h4 className='text-[11px] lg:text-[18px] text-left font-[600]'>{nameServ}</h4>
            </div>
            <div className='ml-1 flex flex-col  items-start text-[11px] lg:text-[15px] font-bold  lg:gap-1 wrap-none'>
                <h4 className=''>{duration}</h4>
                <h4 className='font-extrabold whitespace-nowrap'>{price} RON</h4>
            </div>
    </div>
  )
}

export default Service