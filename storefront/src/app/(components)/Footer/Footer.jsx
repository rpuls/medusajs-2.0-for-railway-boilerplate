import React from 'react'
import waygital from './waygital.webp'
import { Link } from "react-scroll";
import { useNavigate } from 'react-router-dom'
const Footer = () => {
  const navigate=useNavigate();
  return (
    <footer className='relative flex flex-col  justify-center items-center bg-gradient-to-t from-[#0b2a24] to-[#134239] w-full h-full pt-[5rem] pb-[1rem] text-white font-montSerrat'>
        <span className='absolute top-0 left-0 w-screen h-[.5rem] bg-white'/>
        <div className='w-[90%] lg:w-[60rem] flex flex-col items-center lg:items-start lg:grid lg:grid-cols-4 ' >
        <div className='flex flex-col mt-0'>
           <h4>LORENA DANOIU LASH SRL</h4>
           <h4>CUI: 46510830 | J40/13973/2022</h4>
           
        </div>
        <ul className='w-[10rem] mt-[1rem] lg:mt-0'>
          <li className='font-bold '>Navigare</li>
          <li onClick={()=>navigate("/")} className='mt-[1rem] cursor-pointer text-[14px]'>
          <Link
            activeClass="active"
            to="Hero"
            spy={true}
            smooth={true}
            offset={-50}
            duration={500}
            href="Hero"
          >ACASA
          </Link>
          </li>
          <li className='cursor-pointer text-[14px]'>
          <Link
            activeClass="active"
            to="DespreNoi"
            spy={true}
            smooth={true}
            offset={-50}
            delay={200}
            duration={500}
            href="DespreNoi"
          >
          DESPRE NOI
          </Link>
          </li>
          <li onClick={()=>{navigate("salon");window.scrollTo({top:0,left:0})}} className='cursor-pointer text-[14px]'>ECHIPA</li>
     
          <li className='cursor-pointer text-[14px]'>
          <Link
            activeClass="active"
            to="Contact"
            spy={true}
            smooth={true}
            offset={-50}
            duration={500}
            href="Contact"
          >
          CONTACT
          </Link>
          </li>
          <li className='cursor-pointer' onClick={()=>{navigate("/admin"); window.scrollTo({top:0,left:0})}}>ADMIN</li>
        </ul>
        <ul className='w-[10rem] mt-[1rem] lg:mt-0'>
          <li className='font-bold '>Conditii</li>
          <li onClick={()=>{navigate("politica-de-utilizare"); window.scrollTo({top:0,left:0})}} className='mt-[1rem] cursor-pointer text-[14px]'>Politica de utilizare</li>
          <li onClick={()=>{navigate("politica-de-inscriere"); window.scrollTo({top:0,left:0})}} className='cursor-pointer text-[14px]'>Politica de inscriere</li>
          <li onClick={()=>{navigate("politica-de-plata"); window.scrollTo({top:0,left:0})}} className='cursor-pointer text-[14px]'>Politica de plata</li>
          <li onClick={()=>{navigate("politica-de-returnare"); window.scrollTo({top:0,left:0})}} className='cursor-pointer text-[14px]'>Politica de returnare</li>
          <li onClick={()=>{navigate("termeni-si-conditii"); window.scrollTo({top:0,left:0})}} className='cursor-pointer text-[14px]'>Termeni si conditii</li>
        </ul>
        <ul className='w-[10rem] mt-[1rem] lg:mt-0'>
          <li className='font-bold '>Echipa</li>
          <li onClick={()=>{navigate("salon");window.scrollTo({top:600,left:0})}} className='mt-[1rem] cursor-pointer text-[14px]'>Lorena Danoiu (Trainer)</li>
          <li onClick={()=>{navigate("salon");window.scrollTo({top:600,left:0})}} className='cursor-pointer text-[14px]'>Diana Elena Cotet (Master)</li>
          <li onClick={()=>{navigate("salon");window.scrollTo({top:1200,left:0})}} className='cursor-pointer text-[14px]'>Damian Denisa (Master)</li>
          <li onClick={()=>{navigate("salon");window.scrollTo({top:1200,left:0})}} className='cursor-pointer text-[14px]'>Catalina Trica (Brow Artist)</li>
      
        </ul>
        </div>
        <div className='flex mt-[3rem]  flex-col-reverse   lg:flex-row justify-between  items-center lg:items-end w-full lg:w-[60rem]'> 
     
        <a title="Firma creare site de prezentare" href="https://www.waygital.ro/" className='relative flex'>  Site creat de <img src={waygital} alt="Firma de creare site-uri web" className='ml-2 h-[25px] '/></a>
     
        <div className='flex flex-col items-center'>
          <div className='flex items-center w-[12rem] justify-between'>
            <div className='bg-stripe bg-cover w-[70px] h-[35px]'/>
            <div className='bg-visa bg-cover w-[45px] h-[25px]'/>
            <div className='bg-masterCard bg-cover w-[50px] h-[30px]'/>
          </div>
          <h5>@2023 Cursuri gene  - Lorena Lash Studio </h5>
        </div>
        <div className='relative flex flex-col mb-[2rem] lg:mb-0'>
        <a  href="https://anpc.ro/ce-este-sal/"> <div className='bg-cover bg-sal w-[185px] h-[50px]' /></a>
                    <a href="https://ec.europa.eu/consumers/odr" ><div className='bg-cover bg-sol w-[185px] h-[50px]' /></a>
        </div>
      
        </div>
    </footer>

  )
}

export default Footer