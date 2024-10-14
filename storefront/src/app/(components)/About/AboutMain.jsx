"use client"; // Adaugă această linie pentru a marca componenta ca Client Component

import React, { useState } from 'react';


const AboutMain = () => {
  const [activateAbout, setActivateAbout] = useState(false);


  return (
    <div name="DespreNoi" className='relative text-white shadow-xl'>
      <div className='bg-[#0b2a24] flex font-montSerrat flex-col items-center justify-center h-full w-full py-[5rem]'>
        <h5>BUCURESTI</h5>
        <h2 className='font-bold text-[24px] lg:text-[42px] mt-[2rem] z-20'>CINE SUNTEM NOI ?</h2>
        
        <p className='mt-[2rem] lg:text-[20px] font-thin w-[80%] lg:w-[50rem] lg:text-justify'>
          Dragilor, ma numesc <span className='font-normal'>Lorena Danoiu</span> si activez in domeniul extensiilor de gene de <span className='font-normal'>5 ani</span>, in prezent sunt trainer in cadrul propriei academii <span className='font-normal'>Lorena Lash Studio</span>.
          Specializata pe efecte naturale, dar si pe efecte speciale, pot spune ca in cadrul salonului meu vei gasi o multitudine de variante pentru a-ti accesoriza privirea!
          Alaturi de mine le am pe <span className='font-normal'>Diana & Denisa, tehnicieni master cu experienta</span> ce te pot ajuta pentru a obtine rezultatul dorit!
          De asemenea, pentru a-ti completa look-ul, <span className='font-normal'>Brow Expert-ul nostru, Catalina</span>, te va ajuta sa obtii sprancenele la care ai visat!
        </p>
        
        <button 
          onClick={() => {
      
            window.scrollTo({ top: 0, left: 0 });
          }} 
          onMouseEnter={() => setActivateAbout(true)} 
          onMouseLeave={() => setActivateAbout(false)} 
          className={`mt-[4rem] ${activateAbout ? "animate-[aboutBtn_.5s_ease-in-out_forwards]" : "animate-[aboutBtnReverse_.5s_ease-in-out_forwards]"} border-[2px] lg:text-[15px] text-[13px] px-[4rem] lg:px-[7rem] py-[.7rem] lg:py-[1rem] border-white`}>
          DESPRE ECHIPA
        </button>
      </div>
    </div>
  );
}

export default AboutMain;
