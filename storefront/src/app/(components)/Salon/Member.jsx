import React,{useState} from 'react'
import {MdOutlineTouchApp} from 'react-icons/md'
import {HiOutlineCursorClick} from 'react-icons/hi'
import {Fade} from 'react-reveal'
const Member = ({nume,rol,descriere,poze}) => {
  const [showFullImg,setFullImg]=useState(false);
  const [firstImgIndex,setFirstImgIndex1]=useState(0);

  return (
    <Fade>
    <div className='relative flex flex-col items-center lg:justify-center py-[2rem] px-[2rem] w-[20rem] lg:w-[25rem] bg-white h-full lg:h-[35rem] shadow-xl font-montSerrat my-[3rem]'>
        <h3 className='text-[24px] font-bold text-center'>{nume}</h3>
        <h4 className='text-[#DAA520]'>{rol}</h4>
        <p className='text-gray-500 mt-[1rem]'>{descriere}</p>
        <h4 className='flex mt-2 text-[12px] lg:text-[14px]'>Apasa pentru a vedea pozele <span className='lg:hidden text-[18px]'><MdOutlineTouchApp /></span> <span className='hidden lg:inline text-[18px]'><HiOutlineCursorClick /></span></h4>
        <div className='flex items-center'>
   
        <div  className='flex justify-between items-center overflow-hidden  whitespace-nowrap mt-2 w-full lg:overflow-x-hidden overflow-x-scroll cursor-pointer'>
        
          { 
            poze.map((poza,key)=>{
             
                if (key=>firstImgIndex)
                 return <><img alt={`Prezentare gene realizate de ${nume}`} onClick={()=>setFullImg(true)} src={poza} className={`w-[70px] h-[80px] mx-2 aspect-square  ${key<firstImgIndex && "hidden"} `} /></>

                 return null;
            })
          }
          
        </div>
     
        </div>
    </div>
    </Fade>
  )
}

export default Member