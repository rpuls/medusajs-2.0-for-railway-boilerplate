import React from 'react'
import {AiFillStar} from 'react-icons/ai'
const Review = ({name,stars,date,textReview}) => {
  return (
    <div className='w-[25rem] h-[10rem] px-[2rem] py-[.5rem] bg-white shadow-xl '>
        <div>
            <h4>{name}</h4>
            <div className='flex'>
                {[...Array(stars)].map( ()=>{
                     <span className='text-yellow-200 '><AiFillStar /></span>
                })}
                <h4>{date}</h4>
            </div>
        
        </div>

        <p className='w-full h-full mt-[1rem] pb-[2rem]'>
            {textReview}
        </p>
    </div>
  )
}

export default Review