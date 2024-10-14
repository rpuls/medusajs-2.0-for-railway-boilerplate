import React,{useState} from 'react'
import lorena1 from './Images/Lorena_1.jpeg'
import lorena2 from './Images/Lorena_2.jpeg'
import lorena3 from './Images/Lorena_3.jpeg'
import lorena4 from './Images/Lorena_4.jpeg'
import lorena5 from './Images/Lorena_5.jpeg'
import diana1 from './Images/Diana_1.jpeg'
import diana2 from './Images/Diana_2.jpeg'
import diana3 from './Images/Diana_3.jpeg'
import diana4 from './Images/Diana_4.jpeg'
import diana5 from './Images/Diana_5.jpeg'
import stefania1 from './Images/Stefania_1.jpeg'
import stefania2 from './Images/Stefania_2.jpeg'
import stefania3 from './Images/Stefania_3.jpeg'

import catalina1 from './Images/Catalina_1.jpeg'
import catalina2 from './Images/Catalina_2.jpeg'
import catalina3 from './Images/Catalina_3.jpeg'
import catalina4 from './Images/Catalina_4.jpeg'
import catalina5 from './Images/Catalina_5.jpeg'
import gabriela1 from './Images/Gabriela_1.jpeg'
import gabriela2 from './Images/Gabriela_2.jpeg'
import gabriela3 from './Images/Gabriela_3.jpeg'
import gabriela4 from './Images/Gabriela_4.jpeg'

import Member from './Member'
import FullImg from './FullImg'
import {Fade} from 'react-reveal'

const Salon = () => {
  const [showFullImg,setShowFullImg]=useState(-1);
  return (
    <div name="Salon" className='relative flex  flex-col items-center w-full h-full '>
        <div className='flex flex-col items-center w-full lg:w-[60rem] bg-[FEFEFE] top-[6rem] h-full font-montSerrat '>
   
            <div className='relative flex justify-center items-center  h-[35rem] lg:h-[40rem]'>
            <div  className='relative  w-screen lg:w-[60rem] h-[35rem] lg:h-[40rem] bg-teamMobileBg  lg:bg-teamBg  bg-cover bg-center '  />
            <div className='absolute flex justify-center items-center   w-full h-full bg-black bg-opacity-[20%]'>
            <Fade>
              <h1 className='absolute font-oldStandard text-[64px] mt-[10rem] font-bold text-white'>ECHIPA</h1>
              <h2 className='flex items-center font-montSerrat w-[20rem] mt-[20rem] text-center text-white'><span className='w-[4rem] h-[1px] bg-white'/>DESCOPERA ECHIPA NOASTRA DE OAMENI TALENTATI<span className='w-[4rem] h-[1px] bg-white'/></h2>
            </Fade>
            </div>
            </div>
            <div className='w-full lg:w-[60rem]  flex lg:flex-row flex-col items-center lg:items-start flex-wrap justify-between'>
                <div onClick={()=>setShowFullImg(0)}><Member poze={[lorena1,lorena2,lorena3,lorena4,lorena5]} nume="Lorena Danoiu" rol="Trainer" descriere="Buna! Ma numesc Lorena Danoiu, activez de 5 ani in domeniu si in prezent activitatea mea se desfasoara atat in academie ca trainer, cat si in salon ca tehnician. Eu te pot ajuta cu lucrari foarte rapide, voluminoase si efecte speciale, ador sa creez look-uri noi asa ca iti voi asculta ideile urmand sa le pun in aplicare, te astept cu drag"/>
                </div>
                <div onClick={()=>setShowFullImg(1)}><Member poze={[diana1,diana2,diana3,diana4,diana5]} nume="Diana Elena Cotet" rol="Master" descriere="Buna! Ma numesc Diana Elena Cotet si activez de 1 an jumatate in salon, cariera mea a inceput chiar in academia Lorena Lash Studio, sub indrumarea Lorenei, care mi-a propus apoi sa activez in salon.Iti pot accesoriza privirea cu extensii de gene Foxy, Dark Illusion si efecte speciale! Abia astept sa ne vedem! "/>
                </div>
                <div onClick={()=>setShowFullImg(2)}><Member poze={[stefania1,stefania2,stefania3]} nume="Stefania Ursu" rol="Master" descriere="Hello, ma numesc Stefania și am 22 de ani. În lumea fascinantă a genelor, mă consider un artist pasionat și priceput. Cu penseta mea magică și abilitățile dobândite în numeroasele ore de muncă, transform fiecare privire într-un spectacol de frumusețe. Cu atenție la detalii și creativitate, conturez genele cu eleganță și ofer clientelor mele o experiență personalizată, aducând la viață priviri spectaculoase. Te aștept cu drag să descoperi magia genelor și să împărtășești această călătorie a frumuseții alături de mine."/>
                </div>
                <div onClick={()=>setShowFullImg(3)}>
                <Member poze={[catalina1,catalina2,catalina3,catalina4,catalina5]} nume="Catalina Trica " rol="Brow Artist" descriere="Buna, sunt Catalina si iti pot spune ca eu iti pot creea sprancenele la care ai visat dintotdeauna! Fie ca vrei stilizare, vopsit sau laminare, eu te voi asculta si iti voi reda o privire armonioasa conform preferintelor tale! Haide si tu sa iti conturezi privirea!"/>
                </div>
                <div onClick={()=>setShowFullImg(4)}>
                <Member poze={[gabriela1,gabriela2,gabriela3,gabriela4]} nume="Gabriela Andreea Geanta" rol="Brow + Lash Master" descriere="Hello, girls! Numele meu este Gabriela, iar pasiunea mea sunt efectele speciale. Ador sa modelez priviri și să fac femeile să se simtă mai atrăgătoare. Sunt o fire creativa, atenta la detalii și foarte perfecționistă."/>
                </div>
            </div>
            <Fade>
            <h2 className='relative whitespace-nowrap  text-[28px] lg:text-[48px] font-bold   px-[10rem] py-[.5rem] rounded-[8px] bg-[#0b2a24] text-white mt-[10rem]'>
             LISTA PRETURI
          </h2> 
          </Fade>
          <Fade>
         
          <ul className='grid grid-cols-2 place-items-start items-center w-[90%] lg:w-[45rem] mt-[3rem] mb-[10rem] text-[14px] lg:text-[15px] gap-[6px]' >
            <li className='font-bold text-[16px] lg:text-[18px]  '>Trainer Lorena</li>
            <li></li>
            <li className='w-[10rem] lg:w-[16rem]'>1D-3D CLASIC/FOXY</li>
            <li className='w-full text-end font-bold underline'>300 RON</li>
            <li className='w-[10rem] lg:w-[16rem] leading-4' >EFECT SPECIAL (FELINE, WET, EYELINER, HALF ETC)</li>
            <li className='w-full text-end font-bold underline'>350 RON</li>
            <li className='font-bold  text-[16px] lg:text-[18px] mt-[1rem] leading-5'>EXPERT <br /><span className='text-[13px] lg:text-[16px]'> DIANA/STEFANIA/GABRIELA</span></li>
            <li className='text-[13px] lg:text-[16px] ml-4 lg:ml-0 w-full text-right'>APLICARE/INTRETINERE</li>
            <li className='w-[10rem] lg:w-[16rem]'>2D</li>
            <li className='w-full text-end font-bold underline'>230/210 RON</li>
            <li className='w-[10rem] lg:w-[16rem] '>3D</li>
            <li className='w-full text-end font-bold underline'>270/250 RON</li>
            <li className='w-[10rem] lg:w-[16rem]'>EFECT SPECIAL(FELINE, WET, EYELINER, HALF ETC)</li>
            <li className='w-full text-end font-bold underline'>300/280 RON</li>
            <li className='w-[10rem] lg:w-[16rem]'>DEMONTARE</li>
            <li className='w-full text-end font-bold underline'>30 RON</li>
            <li className='w-[10rem] lg:w-[16rem]'>DEMONTARE FARA APLICARE(SPA)</li>
            <li className='w-full text-end font-bold underline'>50 RON</li>
            <li className='font-bold text-[16px] lg:text-[18px] mt-[1rem]'>LAMINARE</li>
            <li />
            <li className=' w-[10rem] lg:w-[16rem]'>LAMINARE GENE</li>
            <li className='w-full text-end font-bold underline'>200 RON</li>
            <li className=' w-[10rem] lg:w-[16rem]'>LAMINARE SPRANCENE</li>
            <li className='w-full text-end font-bold underline'>120 RON</li>
            <li className=' w-[10rem] lg:w-[16rem]'>COMBO LAMI (+STILIZARE)</li>
            <li className='w-full text-end font-bold underline'>350 RON</li>
            <li className='font-bold text-[16px] lg:text-[18px] mt-[1rem]'>BROWS</li>
            <li></li>
            <li className=' w-[10rem] lg:w-[16rem]'>STILIZARE SPRANCENE</li>
            <li className='w-full text-end font-bold underline'>80 RON</li>
            <li className='w-[10rem] lg:w-[16rem]'> LAMINARE SPRANCENE</li>
            <li className='w-full text-end font-bold underline'>120 RON</li>
            <li className='w-[10rem] lg:w-[16rem]'>VOPSIT</li>
            <li className='w-full text-end font-bold underline'>50 RON</li>
            <li className='w-[10rem] lg:w-[16rem] leading-4'>COMPLETE BROWS (STILIZARE&LAMI&VOPSIT)</li>
            <li className='w-full text-end font-bold underline'>220 RON</li>
          </ul>
   
          </Fade>
        </div>
          
            
          <div className={`z-40 fixed flex justify-center items-center left-0 top-0 w-screen h-screen ${showFullImg===-1 && "hidden"}`}>
          <div onClick={()=>setShowFullImg(-1)} className={`fixed ${showFullImg===-1 && "hidden"} z-10 w-screen h-screen bg-black bg-opacity-[40%]`}>
         
         </div>
         <div className={`z-20 ${showFullImg!==0 && "hidden" } `}  >
          <FullImg imagini={[lorena1,lorena2,lorena3,lorena4,lorena5]} />
          </div>
          <div className={`z-20 ${showFullImg!==1 && "hidden" } `}  >
          <FullImg imagini={[diana1,diana2,diana3,diana4,diana5]} />
          </div>
          <div className={`z-20 ${showFullImg!==2 && "hidden" } `}  >
          <FullImg imagini={[stefania1,stefania2,stefania3]} />
          </div>
          <div className={`z-20 ${showFullImg!==3 && "hidden" } `}  >
          <FullImg imagini={[catalina1,catalina2,catalina3,catalina4,catalina5]} />
          </div>
          <div className={`z-20 ${showFullImg!==4 && "hidden" } `}  >
          <FullImg imagini={[gabriela1,gabriela2,gabriela3,gabriela4]} />
          </div>
          </div>
              </div>
  )
}

export default Salon