import React,{useEffect,useRef} from 'react'
import cursEfecteSpeciale from './Imagini/cursEfecteSpeciale.jpeg'
import cursEfecteSpecialeVideo from './Imagini/cursEfecteSpeciale.mp4'
import { Link } from 'react-router-dom';
const CursEfecteSpeciale = () => {
  const videoEl = useRef(null);
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
    <div className='flex justify-center items-center w-full h-full py-[5rem] lg:py-[10rem]'>
    <div className='flex lg:flex-row flex-col items-center lg:items-start'>
    <div className=' lg:ml-[2rem] flex flex-col items-center w-[90%] lg:w-[25rem]'>           
        <img alt="Curs de Efecte Speciale" src={cursEfecteSpeciale} className=" w-[21rem] lg:w-[25rem] " />
        <Link to="/checkout" className='w-full'>
        <button onClick={()=>{localStorage.setItem("cumparaCurs","Curs Efecte Speciale 1 Zi (Avans)");window.scrollTo({top:0,left:0})}} className='mt-[2rem] border-[2px] border-black w-full text-[18px]  h-[3rem] rounded-[8px] tracking-[6px] font-bold animate-[buyBtnReverse_.3s_ease-in-out_forwards] hover:animate-[buyBtn_.3s_ease-in-out_forwards]'>CUMPARA ACUM</button>
        </Link>
        <div className='relative flex flex-col items-left w-full mt-[2rem]'>
            <h3 className='mb-[1rem] text-[18px] text-justify'>Achiti   <span className='font-bold'>AVANSUL</span> de <span className='font-bold'>500 de lei </span> aici sau la locatie pentru a-ti rezerva locul, restul sumei se achita in prima zi de curs</h3>
          
            <h3 className='text-[24px] font-thin mt-[1rem]'>1 ZI<span className='absolute right-2 font-extrabold text-[#DAA520]'>950  lei </span> <h3 className='relative flex flex-col justify-center items-center text-[18px] font-extrabold text-gray-300'> <span>(150 Lei Reducere)</span> De la 1100 lei  </h3> </h3>
   
        </div>
        </div>
        <div className='relative lg:ml-[4rem] mt-[2rem] lg:mt-0 flex flex-col items-center w-[90%] lg:w-[40rem]'>
            
                <h1 className='text-[42px] font-oswald font-bold text-center'>Curs Foxy For a Day </h1>
                <h2 className='text-[28px] font-norican'>Avansati</h2>
                <div className='w-[90%]  text-justify mt-[2rem] font-montSerrat'>
               
                 <p>
                 Acest curs este dedicat tehnicienilor cu experienta de minim 6 luni ce isi doresc sa treaca la urmatorul nivel si sa ofere cele mai ravnite efecte precum: Foxy, Eyeliner, Kim K, Wet, s.a. 

Daca te-ai plafonat si iti doresti sa incerci noi efecte, acesta este cursul perfect pentru tine, 90% dintre clientii nostri aleg efectul Foxy, trendul anului! Haide cu noi sa iti aratam cum poti sa iti maresti baza de clienti cu aceste efecte! 
                </p>
                <h4 className='font-bold mt-[1rem] text-[20px] text-center '>Program curs : </h4>
                
                <ol>
                    <li className='mt-[1rem]'><span className='font-bold'>10.00 </span>-  Teorie</li>
                    <li className='mt-[1rem]'><span className='font-bold'>13.00 </span>-  Pauza de masa</li>
                    <li className='mt-[1rem]'><span className='font-bold'>14.00 </span>-  Demonstratie Trainer</li>
                    <li className='mt-[1rem]'><span className='font-bold'>15.00 </span>-  Aplicare pe model uman </li>
                    <li className='mt-[1rem]'><span className='font-bold'>19.00 </span>-  Inmanare Diplome&Poze </li>
                </ol>
                <div className='flex justify-center h-[40rem] mt-[5rem]'>
                            <video
                                style={{ maxWidth: "100%", width: "25rem",height:"100%", margin: "100 auto",objectFit:"cover"}}
                                playsInline
                                loop
                                muted
                                controls
                                alt="All the devices"
                                src={cursEfecteSpecialeVideo}
                                ref={videoEl}
                                />
                </div>
                </div>
        </div>
    </div>
</div>
  )
}

export default CursEfecteSpeciale