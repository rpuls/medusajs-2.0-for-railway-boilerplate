import React,{useState} from 'react'
import {AiFillCaretLeft,AiFillCaretRight} from 'react-icons/ai'

const FullImg = ({imagini}) => {
    const [showImg,setShowImg]=useState(0)
    return (
    <div className='flex items-center justify-center w-[500px]  '>
        <span onClick={()=>{if(showImg>0) setShowImg(prev=>prev-=1); else setShowImg(imagini.length-1)}} className='text-[64px] lg:text-[200px] text-white cursor-pointer'><AiFillCaretLeft /></span>
        {
            imagini.map((imag,key)=>{
                console.log(key)
                return <><img  className={`w-[50%] lg:w-[600px] ${key!==showImg && "hidden"}`} src={imag}  /></>
            })
      
        }
      <span onClick={()=>{if(showImg<imagini.length-1) setShowImg(prev=>prev+=1); else setShowImg(0)}} className='text-[64px] lg:text-[200px] text-white cursor-pointer'><AiFillCaretRight /></span>
    </div>
  )
}

export default FullImg