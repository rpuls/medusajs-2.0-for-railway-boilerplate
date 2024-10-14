import {BsInstagram,BsFillPinMapFill} from 'react-icons/bs'

import {AiOutlineMail,AiOutlineWhatsApp} from 'react-icons/ai'
const Contact = () => {

  return (
    <div name="Contact" className='flex flex-col items-center   w-full h-full flex  py-[5rem] font-montSerrat bg-[#0b2a24] text-white'>
           <h2 className='relative  text-[28px] lg:text-[48px] font-bold  px-[10rem] py-[.5rem] rounded-[8px] text-white'>
          CONTACT
        </h2>
        <div className='flex  mt-[2rem]'>
            <a href='https://www.instagram.com/lorenalashstudio/' className='flex justify-center items-center  w-[50px] lg:w-[60px] h-[50px] lg:h-[60px] rounded-[50%] text-[28px] bg-white text-[#0b2a24]  mx-2'>
                <BsInstagram/>
            </a>
            <a href="http://wa.me/+40764038271" className='text-[24px] lg:text-[32px] font-bold flex mx-2 mt-[.5rem]'  ><span className='text-[28px] lg:text-[36px] mt-1 lg:mt-2 mr-1 ' ><AiOutlineWhatsApp/></span>0764038271</a>
        
        
            <a href="mailto:lorenalashstudio@gmail.com" className='flex justify-center items-center w-[50px] lg:w-[60px] h-[50px] lg:h-[60px] rounded-[50%] text-[24px] lg:text-[32px] bg-white text-[#0b2a24]  mx-2 cursor-pointer'>
                <AiOutlineMail/>
            </a>
            
        </div>
        <div className='flex  flex-col items-center mt-[3rem]'>
            <h2 className='text-[24px] lg:text-[38px] font-extrabold' >LOCATIE</h2>
            <div className='flex items-center '>
                <div className='flex mt-[1rem] justify-center items-center w-[60px] h-[60px]  rounded-[50%] text-[28px] bg-white text-[#0b2a24] mb-[1rem]'>
                <BsFillPinMapFill/>
               
            </div>
            <h3 className='text-[16px] w-[12rem] ml-2'>Bucuresti , Sectorul 4 , strada Povestei , nr. 10</h3>
            </div>
            <div className='w-full lg:w-[40rem] h-[25rem] mt-[1rem]'>
            <iframe title="Indicatii de orientare catre salon" width="100%" height="100%" src="https://maps.google.com/maps?width=700&amp;height=440&amp;hl=en&amp;q=%F0%9D%90%92%F0%9D%90%AD%F0%9D%90%AB%F0%9D%90%9A%F0%9D%90%9D%F0%9D%90%9A%20%F0%9D%90%8F%F0%9D%90%A8%F0%9D%90%AF%F0%9D%90%9E%F0%9D%90%AC%F0%9D%90%AD%F0%9D%90%9E%F0%9D%90%A2%20%F0%9D%9F%8F%F0%9D%9F%8E+(Title)&amp;ie=UTF8&amp;t=&amp;z=10&amp;iwloc=B&amp;output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>
            </div>
        </div>
   
    </div>
  )
}

export default Contact