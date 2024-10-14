import React, { useEffect, useRef } from "react";
import { useState } from 'react'
import {AiOutlineArrowDown} from 'react-icons/ai'
import { Link  } from "react-scroll";
import {Fade} from 'react-reveal'

const Hero = () => {

    const videoEl = useRef(null);
    const [hovered,setHovered]=useState(false);
    const attemptPlay = () => {
      videoEl &&
        videoEl.current &&
        videoEl.current.play().catch(error => {
          console.error("Error attempting to play", error);
        });
    };
    useEffect(() => {
      attemptPlay();
    }, []);

  
  return (
    <div name="Hero" className='relative flex justify-center items-center w-full h-screen bg-bgHero  bg-cover bg-center '>

        <div  className="absolute   w-full h-full bg-black opacity-[70%]">
      
          </div>
          <div className="absolute top-[12rem] lg:top-0 flex flex-col items-center justify-start lg:justify-center w-full h-full">

          <Fade>
          <div className="flex flex-col gap-8 items-center justify-between mt-[2rem] lg:mt-[5rem] ">
          <Link
            activeClass="active"
            to="DespreNoi"
            spy={true}
            smooth={true}
            offset={-50}
            duration={500}
            href="DespreNoi"
          >
          <button onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} className={`flex ${hovered ? "animate-[aboutBtn_.3s_ease-in-out_forwards]" : "animate-[aboutBtnReverse_.3s_ease-in-out_forwards]"} text-white border-[1px] border-white px-[2rem] lg:px-[4rem] py-[.7rem] text-[12px] lg:text-[15px] font-bold`}>EXPLOREAZA <span className="text-[18px] lg:text-[22px] ml-2 " ><AiOutlineArrowDown /></span></button>
        </Link>

          </div>
          </Fade>
          </div>
         
        <div className="absolute z-30 left-0 w-full h-[7rem] bg-gradient-to-b from-transparent to-[#0b2a24] bottom-0 "/>
    </div>
  )
}

export default Hero